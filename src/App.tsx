import React, { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid.tsx";
import { WORDS } from "./words.ts";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  COLORS,
  keyboardLetters,
  winAudio,
  invalidAudio,
  popAudio,
  popAudioFilePath,
  LETTER_REGEX,
  gameOverAudio,
  TILE
} from "./constants.ts";
import {
  IKeyboardKey,
  ILetter,
  ILetterWithDist,
  IOccurrence,
  ISmallestAndLargestIndexes,
  ITile,
} from "./interfaces";
import Keyboard from "./components/Keyboard.tsx";
import Modal from "./components/Modal.tsx";

const App = () => {
  const [correctWord, setCorrectWord] = useState<string>("");
  const [wordsList, setWordsList] = useState<Set<string> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [foundWord, setFoundWord] = useState<boolean>(false);

  const [grid, setGrid] = useState<ITile[][]>([]);
  const [keyboard, setKeyboard] = useState<IKeyboardKey[]>([]);

  const [hasClosedModal, setHasClosedModal] = useState<boolean>(false);

  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
  const [currentTileIndex, setCurrentTileIndex] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const createWordsList = (arrOfWords: string[]) => {
    const words: Set<string> = new Set(arrOfWords);

    return setWordsList(words);
  };

  const handleKeyDown = (ev: KeyboardEvent): void => {
    if (LETTER_REGEX.test(ev.key) && ev.key.length === 1) {
      return addLetter(ev.key);
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "backspace") {
      return deleteLetter();
    }
  };

  const handleKeyClick = (letter: string): void => {
    if (/^[a-zA-Z]$/.test(letter) && letter.length === 1) {
      return addLetter(letter);
    } else if (letter.length > 1 && letter.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (letter.length > 1 && letter.toLowerCase() === "del") {
      return deleteLetter();
    }
  };

  const handleEnterKey = (): void => {
    if (currentTileIndex === WORD_LENGTH) {
      return checkRow(currentRowIndex);
    } else if (currentTileIndex < WORD_LENGTH) {
      playAudio(invalidAudio);
      shakeRow();
      return setErrorMessage("Too short");
    }
  };

  const addLetter = (letter: string): void => {
    playAudio(popAudio);
    
    setGrid([
      ...grid.map((row: ITile[], rowIndex: number) => {
        if (rowIndex === currentRowIndex) {
          return row.map((tile: ITile , tileIndex: number) => {
            if (
              tileIndex === currentTileIndex &&
              currentTileIndex + 1 <= WORD_LENGTH
            ) {
              setCurrentTileIndex(currentTileIndex + 1);
              return {
                ...tile,
                letter,
              };
            } else return tile;
          });
        } else return row;
      }),
    ]);
  };
  
  const deleteLetter = (): void => {
    return setGrid([
      ...grid.map((row: ITile[], rowIndex: number) => {
        if (rowIndex === currentRowIndex) {
          return row.map((tile: ITile, tileIndex: number) => {
            if (tileIndex === currentTileIndex - 1) {
              setCurrentTileIndex(currentTileIndex - 1);
              return {
                ...tile, 
                letter: ""
              }
            } else return tile;
          });
        } else return row;
      }),
    ]);
  };

  const playAudio = (audioFile: HTMLAudioElement): Promise<void> => {
    return audioFile.play();
  };

  const shakeRow = (): void => {
    setGrid(grid.map((row: ITile[], rowIndex: number) => {
      if (rowIndex === currentRowIndex) {
        return row.map((tile: ITile) => {
          if (tile.letter) {
            return {
              ...tile,
              colorClass: `${tile.colorClass.includes('shake') ? '' : `${tile.colorClass} shake`}`
            }
          } else return tile;
        })
      } else return row;
    }))
  };
  
  const handleRemoveShake = (): void => {
    setGrid(grid.map((row: ITile[], rowIndex: number) => {
      if (rowIndex === currentRowIndex) {
        return row.map((tile: ITile) => {
          return {
            ...tile,
            colorClass: `${tile.colorClass.replace('shake', '')}`
          }
        })
      } else return row;
    }))
  };

  const checkRow = (rowIndex: number): void => {
    const word: string = grid[rowIndex].map((tile: ITile) => tile.letter).join("");
    const guessedWord: string = word.toLowerCase();

    if (wordsList?.has(guessedWord)) {
      if (guessedWord === correctWord) {
        // WIN
        playAudio(winAudio);

        let delay: number = 0;

        const updatedGrid: ITile[][] = grid.map((row: ITile[], rowIdx: number) => {
          if (rowIdx === currentRowIndex) {
            return row.map((tile: ITile) => {
              const updatedTile: ITile = setColorClass(tile, COLORS.GREEN);
              
              delay+=0.5;

              return {
                ...updatedTile,
                delay
              }
            });
          } else return row;
        });

        setGrid(updatedGrid);

        setFoundWord(true);
        setIsGameOver(true);

        return;

      } else {
        return checkLetters(guessedWord);
      }
    } else {
      // Word not in list
      setErrorMessage("Word not in list");

      playAudio(invalidAudio);

      shakeRow();
    }
  };

  const filterGreenLetters = (word: string): {[key: string]: ILetter[]} => {
    const greenLetters: ILetter[] = [];
    const notGreenLetters: ILetter[] = [];

    // Green Letters
    for (let i = 0; i < word.length; i++) {
      const letterAtCurrentIndex: string = word[i];
      const letterInCorrectWordAtCurrentIndex: string = correctWord[i];

      if (letterAtCurrentIndex === letterInCorrectWordAtCurrentIndex) {
        if (greenLetters.some((gl: ILetter) => gl.letter === letterAtCurrentIndex && gl.index !== i)) {
          greenLetters.push({
            letter: letterAtCurrentIndex,
            index: i,
          });
        }

        // If letter L is not in greenLetters, add it
        else if (!greenLetters.filter((gl: ILetter) => gl.letter === letterAtCurrentIndex).length) {
          greenLetters.push({
            letter: letterAtCurrentIndex,
            index: i,
          });
        }

        // If letter L is not at the right index and so not in greenLetters, but is in the repeatedLetters array,
        // add it to the letters array in order to set its color to gray or yellow after
      } else {
        notGreenLetters.push({
          letter: letterAtCurrentIndex,
          index: i,
        });
      }
    }

    return {
      greenLetters,
      notGreenLetters
    };
  };

  const filterYellowLetters = (
    word: string,
    greenLetters: ILetter[],
    lettersOccurrencesInCorrectWord: IOccurrence,
    lettersOccurrencesInGuessedWord: IOccurrence
  ): {[key: string]: ILetter[]} => {

    let yellowLetters: ILetter[] = [];
    const grayLetters: ILetter[] = [];

    for (let i = 0; i < word.length; i++) {
      const letter: string = word[i];

      const numOfGreens: number = greenLetters.filter((gLetter: ILetter) => gLetter.letter === letter).length;
      
      const numOfOccurrencesInCorrectWord: number = lettersOccurrencesInCorrectWord[letter] || 0;
          
      const numOfYellows: number = numOfOccurrencesInCorrectWord - numOfGreens;
      
      const inGreenAtDifferentIndex: boolean = greenLetters.some((gLetter: ILetter) => gLetter.letter === letter && gLetter.index !== i);

      const inGreenAtSameIndex: boolean = greenLetters.some((gLetter: ILetter) => gLetter.letter === letter && gLetter.index === i);

      if (inGreenAtSameIndex) continue;

      else if (numOfYellows) {
          yellowLetters.push({letter, index: i});

          // In Guessed Word
          const quantityOfLetterInYellowsEqualsOccurrencesInGuessedWord: boolean = yellowLetters.filter((yel: ILetter) => 
            yel.letter === letter).length === lettersOccurrencesInGuessedWord[letter];
          // In Correct Word
          const quantityOfLetterInYellowsEqualsOccurrencesInCorrectWord: boolean = yellowLetters.filter((yel: ILetter) => 
            yel.letter === letter).length === lettersOccurrencesInCorrectWord[letter];

          // Occurrences of letter in Guessed Word larger than or equal 2
          const occurrencesInGuessedLargerThanOne: boolean = lettersOccurrencesInGuessedWord[letter] >= 2;

          if ((quantityOfLetterInYellowsEqualsOccurrencesInGuessedWord || quantityOfLetterInYellowsEqualsOccurrencesInCorrectWord)
            && occurrencesInGuessedLargerThanOne) {
              const duplicatedLetters = yellowLetters.filter((yel: ILetter) => yel.letter === letter);
  
              const {
                smallest: letterAtClosestIndex,
                largest: letterAtLargestIndex
              }: {smallest: ILetter, largest: ILetter} = calculateClosestIndex(correctWord, duplicatedLetters, letter);
              
              const shouldBeGray: ILetter[] = yellowLetters.filter((yel: ILetter) =>
                (yel.letter === letter && yel.index !== letterAtClosestIndex.index)
                || (!correctWord.includes(yel.letter))
                || (yel.letter === letter && yel.index === letterAtLargestIndex.index));

              grayLetters.push(...shouldBeGray);

              const otherYellowLetters: ILetter[] = yellowLetters.filter((yel: ILetter) => (yel.letter !== letter));
              const otherYellowLettersAndSameLettersAtDifferentIndexes: ILetter[] = yellowLetters.filter((yel: ILetter) => (yel.letter !== letter)
                || (yel.letter === letter && yel.index !== correctWord.lastIndexOf(letter)));

              const updatedYellowLetters: ILetter[] = !numOfGreens
                ? [...otherYellowLettersAndSameLettersAtDifferentIndexes, letterAtClosestIndex, letterAtLargestIndex]
                : [...otherYellowLetters, letterAtClosestIndex];
                
                yellowLetters = [...updatedYellowLetters];
              }
        }

      else if (inGreenAtDifferentIndex) grayLetters.push({letter, index: i});
      else if (!correctWord.includes(letter)) grayLetters.push({letter, index: i});
    }

    return {
      yellowLetters,
      grayLetters
    }
  };

  const calculateClosestIndex = (correctWord: string, letters: ILetter[], letter: string): ISmallestAndLargestIndexes => {
    const correctLetterIndex: number = correctWord.indexOf(letter);
    const correctLetterLastIndex: number = correctWord.lastIndexOf(letter);

    const mapIndexesMinusCorrectLetterIndex: ILetterWithDist[] = letters.map((dupL: ILetter) => {
        return {
            ...dupL,
            distFromCorrectIndex: dupL.index - correctLetterIndex,
            distFromCorrectLastIndex: dupL.index - correctLetterLastIndex
        };
    });

    const closestIndexUnderZero: ILetterWithDist | undefined = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => (l.distFromCorrectIndex === -1));

    if (closestIndexUnderZero) {
      const otherLetter: ILetterWithDist = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => (l.distFromCorrectIndex !== -1)) as ILetterWithDist;
      
      return {
          smallest: {
              letter,
              index: closestIndexUnderZero
                ? closestIndexUnderZero.index
                : otherLetter.index
          },
          largest: {
              letter: otherLetter?.letter,
              index: otherLetter?.index
          }
      };
    }

    // If no letter with distance -1, find the letter with the smallest positive distance
    const smallestPositiveDistance: number | undefined = mapIndexesMinusCorrectLetterIndex.filter((l: ILetterWithDist) => l.distFromCorrectIndex > 0)[0]?.distFromCorrectIndex;

    const closestLetter: ILetterWithDist = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l.distFromCorrectIndex === smallestPositiveDistance) as ILetterWithDist;

    // Find the other letter for the largest
    const otherLetter: ILetterWithDist = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l !== closestLetter) as ILetterWithDist;

    return {
        smallest: {
            letter,
            index: closestLetter ? closestLetter.index : otherLetter.index
        },
        largest: {
            letter: otherLetter?.letter,
            index: otherLetter?.index
        }
    };
  };

  const checkLetters = (word: string): void => {
    const lettersOccurrencesInCorrectWord: {[key: string] : number} = getRepeatedLetters(correctWord);
    const lettersOccurrencesInGuessedWord: {[key: string] : number} = getRepeatedLetters(word);

    const {greenLetters}: {[key: string]: ILetter[]} = filterGreenLetters(word);
    const {yellowLetters, grayLetters}: {[key: string]: ILetter[]} = filterYellowLetters(
      word,
      greenLetters,
      lettersOccurrencesInCorrectWord,
      lettersOccurrencesInGuessedWord
    );

    let updatedGrid: ITile[][] = grid;

    // Green
    for (let g = 0; g < word.length; g++) {
        updatedGrid = updatedGrid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (greenLetters.some((gl: ILetter) => gl.index === tileIndex)) {
                        
                        return setColorClass(tile, COLORS.GREEN);
                    } else return tile;
                })
            } else return row;
        })
    }

    // Yellow
    for (let y = 0; y < word.length; y++) {
        updatedGrid = updatedGrid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (yellowLetters.some((yl: ILetter) => yl.index === tileIndex)) {
                        
                        return setColorClass(tile, COLORS.YELLOW);
                    } else return tile;
                })
            } else return row;
        })
    }

    // Gray
    for (let g = 0; g < word.length; g++) {
        updatedGrid = updatedGrid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (grayLetters.some((grayL: ILetter) => grayL.index === tileIndex)) {
                        
                        return setColorClass(tile, COLORS.GRAY);
                    } else return tile;
                })
            } else return row;
        })
    }

    // Update grid
    setGrid(updatedGrid);

    // Update keyboard
    updateKeyboard(grayLetters, yellowLetters, greenLetters);
    
    // Set next guess
    updateGuess();
  };

  const updateGuess = (): void => {
    if ((currentRowIndex + 1) < MAX_GUESSES) {
      setCurrentRowIndex(currentRowIndex + 1);
      setCurrentTileIndex(0);
    } else {
      playAudio(gameOverAudio);
      setIsGameOver(true)
    }
  };

  const updateKeyboard = (grayLetters: ILetter[], yellowLetters: ILetter[], greenLetters: ILetter[]): void => {
    setKeyboard(keyboard.map((kbKey: IKeyboardKey) => {

      const inGrayLetters: boolean = grayLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);
      const inYellowLetters: boolean = yellowLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);
      const inGreenAtDifferentIndexLetters: boolean = greenLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);

      // In Gray letters && NOT in Yellow letters && NOT in Green letters
      const onlyInGrayLetters: boolean = inGrayLetters && !inYellowLetters && !inGreenAtDifferentIndexLetters;

      if (onlyInGrayLetters) {
        return {
          ...kbKey,
          colorClass: COLORS.GRAY
        }
      } else return kbKey;
    }))
  };

  const resetKeyboard = (): void => {
    setKeyboard(keyboard.map((kbKey: IKeyboardKey) => {
      if (kbKey.colorClass) {
        return {
          ...kbKey,
          colorClass: ''
        }
      } else return kbKey;
    }))
  };

  const getRepeatedLetters = (word: string): IOccurrence => {
    const letters: string[] = Array.from(word);

    const letterCounts: IOccurrence = {};

    letters.forEach((ltr: string) => {
      const letter: string = ltr.toLowerCase();
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    return letterCounts;
  };

  const setColorClass = (tile: ITile, colorClass: string): ITile => {
    return {
      ...tile,
      colorClass
    };
  };

  const resetGame = (): void => {
    setIsGameOver(false);
    setCurrentRowIndex(0);
    setCurrentTileIndex(0);
    setFoundWord(false);
    chooseRandomWord();
    setGrid(resetGrid(MAX_GUESSES, WORD_LENGTH));
    resetKeyboard();
  };

  const resetGrid = (rows: number, cols: number): ITile[][] => {
    const newGrid: ITile[][] = [];

    for (let i = 0; i < rows; i++) {
      const row: ITile[] = [];

      for (let j = 0; j < cols; j++) {
        row.push(TILE);
      }

      newGrid.push(row);
    }

    return newGrid;
  };

  const chooseRandomWord = (): void => {
    const randomWord: string = WORDS[Math.floor(Math.random() * WORDS.length)];
    // const randomWord: string = 'octet';
    // const randomWord: string = 'spasm';
    console.log("Word: ", randomWord);

    setCorrectWord(randomWord);
  };

  // Choose random word
  useEffect(() => {
    chooseRandomWord();
  }, [wordsList]);

  // Create words list, grid and keyboard
  useEffect(() => {
    createWordsList(WORDS);

    setGrid(resetGrid(MAX_GUESSES, WORD_LENGTH));

    setKeyboard(keyboardLetters.map((kLetter: string) => {
      return {
        key: kLetter,
        colorClass: ''
      }
    }))
  }, []);

  // Add keydown event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // document.addEventListener("click", handleKeyClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // document.removeEventListener("click", handleClick);
    };
  }, [currentTileIndex, grid]);

  // Error timeout
  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  }, [errorMessage]);

  // Handle win
  useEffect(() => {
    if (isGameOver) {
      document.removeEventListener("keydown", handleKeyDown);
    } else if (!isGameOver) {
      document.addEventListener("keydown", handleKeyDown);
    }
  }, [isGameOver]);

  return (
    <div id="game-container">

      {isGameOver &&
        <Modal
          correctWord={correctWord}
          resetGame={resetGame}
          foundWord={foundWord}
          setHasClosedModal={setHasClosedModal}
        />}

      <h1 className="title">Wordle</h1>

      <audio ref={audioRef} src={popAudioFilePath} />
      
      <div className="space error">
        {errorMessage && (
          <p id="message" className="message error">
            {errorMessage}
          </p>
        )}
      </div>

      <Grid grid={grid} resetGrid={() => resetGrid(MAX_GUESSES, WORD_LENGTH)} handleRemoveShake={handleRemoveShake}/>

      <Keyboard handleKeyClick={handleKeyClick} keyboard={keyboard}/>
      {isGameOver && hasClosedModal && (
        <button onClick={resetGame} id="playAgain" className="reset lg">
            Play again
        </button>
      )}
    </div>
  );
}
export default App;