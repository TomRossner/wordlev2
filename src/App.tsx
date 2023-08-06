// import "./index.scss";
import { useState, useEffect } from "react";
import Grid from "./components/Grid.tsx";
import { WORDS } from "./words.ts";
import { MAX_GUESSES, WORD_LENGTH, COLORS, keyboardLetters, winAudio, invalidAudio } from "./constants.ts";
import { ICorrectWord, IErrorMessage, IFoundWord, IGameOver, IGrid, IKeyboardKey, ILetter, ILetterWithDist, IRowIndex, ISmallestAndLargestIndexes, ITile, ITileIndex, IWordsList } from "./interfaces";
import React from "react";
import Keyboard from "./components/Keyboard.tsx";

const App = () => {
  const [correctWord, setCorrectWord] = useState<ICorrectWord>({correctWord: ""});
  const [wordsList, setWordsList] = useState<IWordsList>({});
  const [errorMessage, setErrorMessage] = useState<IErrorMessage | null>(null);

  const [isGameOver, setIsGameOver] = useState<IGameOver>({isGameOver: false});
  const [foundWord, setFoundWord] = useState<IFoundWord>({foundWord: false});

  const [grid, setGrid] = useState<IGrid>({grid: []});
  const [keyboard, setKeyboard] = useState<IKeyboardKey[]>([]);

  const createWordsList = (arrOfWords: string[]) => {
    const words: {[key: string] : string} = {};

    for (let word of arrOfWords) {
      if (!wordsList[word]) {
        words[word] = word;
      }
    }

    return setWordsList(words);
  };

  const [currentRowIndex, setCurrentRowIndex] = useState<IRowIndex>({currentRowIndex: 0});
  const [currentTileIndex, setCurrentTileIndex] = useState<ITileIndex>({currentTileIndex: 0});

  const handleKeyDown = (ev: KeyboardEvent): void => {
    if (/^[a-zA-Z]$/.test(ev.key) && ev.key.length === 1) {
      return addLetter(ev.key);
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "backspace") {
      return deleteLetter();
    }
  };
  const handleKeyClick = (letter: string): void => {
    console.log(letter)
    if (/^[a-zA-Z]$/.test(letter) && letter.length === 1) {
      return addLetter(letter);
    } else if (letter.length > 1 && letter.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (letter.length > 1 && letter.toLowerCase() === "del") {
      return deleteLetter();
    }
  };

  const handleEnterKey = (): void => {
    if (currentTileIndex.currentTileIndex === WORD_LENGTH) {
      return checkRow(currentRowIndex.currentRowIndex);
    } else if (currentTileIndex.currentTileIndex < WORD_LENGTH) {
      return setErrorMessage({errorMessage: "Too short"});
    }
  };

  const addLetter = (letter: string): void => {
    setGrid({grid: [
      ...grid.grid.map((row: ITile[], rowIndex: number) => {
        if (rowIndex === currentRowIndex.currentRowIndex) {
          return row.map((tile: ITile , tileIndex: number) => {
            if (
              tileIndex === currentTileIndex.currentTileIndex &&
              currentTileIndex.currentTileIndex + 1 <= WORD_LENGTH
            ) {
              setCurrentTileIndex({currentTileIndex: currentTileIndex.currentTileIndex + 1});
              return {
                ...tile,
                letter,
              };
            } else return tile;
          });
        } else return row;
      }),
    ]});
  };

  const deleteLetter = (): void => {
    return setGrid({grid: [
      ...grid.grid.map((row: ITile[], rowIndex: number) => {
        if (rowIndex === currentRowIndex.currentRowIndex) {
          return row.map((tile: ITile, tileIndex: number) => {
            if (tileIndex === currentTileIndex.currentTileIndex - 1) {
              setCurrentTileIndex({currentTileIndex: currentTileIndex.currentTileIndex - 1});
              return {
                ...tile, 
                letter: ""
              }
            } else return tile;
          });
        } else return row;
      }),
    ]});
  };

  const playAudio = (audioFile: HTMLAudioElement): Promise<void> => {
    return audioFile.play();
  }

  const shakeRow = (): void => {
    setGrid({grid: grid.grid.map((row: ITile[], rowIndex: number) => {
      if (rowIndex === currentRowIndex.currentRowIndex) {
        return row.map((tile: ITile) => {
          return {
            ...tile,
            colorClass: tile.colorClass + ' shake'
          }
        })
      } else return row;
    })})
  }

  const checkRow = (rowIndex: number): void => {
    const word: string = grid.grid[rowIndex].map((tile: ITile) => tile.letter).join("");
    const guessedWord: string = word.toLowerCase();

    if (wordsList[guessedWord]) {
      if (guessedWord === correctWord.correctWord) {
        // WIN
        const updatedGrid: ITile[][] = grid.grid.map((row: ITile[], rowIdx: number) => {
          if (rowIdx === currentRowIndex.currentRowIndex) {
            return row.map((tile: ITile) => setGreen(tile));
          } else return row;
        });

        setGrid({grid: updatedGrid});

        setIsGameOver({isGameOver: true});
        setFoundWord({foundWord: true});

        playAudio(winAudio);

        return;
      } else {
        return checkLetters(guessedWord);
      }
    } else {
      // Word not in list
      console.log(`The word '${guessedWord}' does not exist`);
      setErrorMessage({errorMessage: "Word not in list"});
      playAudio(invalidAudio);
      // shakeRow(); // Needs fix
    }
  };

  const checkLetters = (word: string): void => {
    const lettersOccurrencesInCorrectWord: {[key: string] : number} = getRepeatedLetters(correctWord.correctWord);
    const lettersOccurrencesInGuessedWord: {[key: string] : number} = getRepeatedLetters(word);

    const greenLetters: ILetter[] = [];

    const notGreenLetters: ILetter[] = [];

    let yellowLetters: ILetter[] = [];

    const grayLetters: ILetter[] = [];

    // Green Letters
    for (let i = 0; i < word.length; i++) {
      const letterAtCurrentIndex: string = word[i];
      const letterInCorrectWordAtCurrentIndex: string = correctWord.correctWord[i];

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

    // Yellow & Gray Letters
    for (let i = 0; i < word.length; i++) {
        const letter: string = word[i];

        const numOfGreens: number = greenLetters.filter((gLetter: ILetter) => gLetter.letter === letter).length;

        const numOfOccurrencesInCorrectWord: number = lettersOccurrencesInCorrectWord[letter] || 0;
            
        const numOfYellows: number = numOfOccurrencesInCorrectWord - numOfGreens;

        const inGreenAtDifferentIndex: boolean = greenLetters.some((gLetter: ILetter) => gLetter.letter === letter && gLetter.index !== i);

        const inGreenAtSameIndex: boolean = greenLetters.some((gLetter: ILetter) => gLetter.letter === letter && gLetter.index === i);

        if (inGreenAtSameIndex) continue;

        else if (numOfYellows && !inGreenAtDifferentIndex) {
            yellowLetters.push({letter, index: i});

            // In Guessed Word
            const quantityOfLetterInYellowsEqualsOccurrencesInGuessedWord: boolean = (yellowLetters.filter((yel: ILetter) => yel.letter === letter).length === lettersOccurrencesInGuessedWord[letter]);
            // In Correct Word
            const quantityOfLetterInYellowsEqualsOccurrencesInCorrectWord: boolean = (yellowLetters.filter((yel: ILetter) => yel.letter === letter).length === lettersOccurrencesInCorrectWord[letter]);

            // Occurrences of letter in Guessed Word larger than or equal 2
            const occurrencesInGuessedLargerThanOne: boolean = (lettersOccurrencesInGuessedWord[letter] >= 2);

            // Calculate closest index
            const calculateClosestIndex = (correctWord: string, letters: ILetter[]): ISmallestAndLargestIndexes => {
              const correctLetterIndex: number = correctWord.indexOf(letter);
          
              const mapIndexesMinusCorrectLetterIndex: ILetterWithDist[] = letters.map((dupL: ILetter) => {
                  return {
                      ...dupL,
                      distFromCorrectIndex: dupL.index - correctLetterIndex
                  };
              });
          
              const closestIndexUnderZero: ILetterWithDist | undefined = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l.distFromCorrectIndex === -1);
          
              if (closestIndexUnderZero) {
                const otherLetter: ILetterWithDist = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l.distFromCorrectIndex !== -1) as ILetterWithDist;

                return {
                    smallest: {
                        letter,
                        index: closestIndexUnderZero ? closestIndexUnderZero.index : otherLetter.index
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
                      index: closestLetter? closestLetter.index : otherLetter.index
                  },
                  largest: {
                      letter: otherLetter?.letter,
                      index: otherLetter?.index
                  }
              };
          };
          

            if ((quantityOfLetterInYellowsEqualsOccurrencesInGuessedWord || quantityOfLetterInYellowsEqualsOccurrencesInCorrectWord) && occurrencesInGuessedLargerThanOne) {
                const duplicatedLetters = yellowLetters.filter((yel: ILetter) => yel.letter === letter);
    
                const letterAtClosestIndex: ILetter = calculateClosestIndex(correctWord.correctWord, duplicatedLetters).smallest;
                
                // const letterAtFarthestIndex: ILetter = calculateClosestIndex(correctWord.correctWord, duplicatedLetters).largest;
                
                grayLetters.push(...yellowLetters.filter((yel: ILetter) => yel.letter === letter && yel.index !== letterAtClosestIndex.index));
    
                const updatedYellowLetters: ILetter[] = [...yellowLetters.filter((yel: ILetter) => yel.letter !== letter), letterAtClosestIndex];
    
                yellowLetters = [...updatedYellowLetters];
            }
        }

        else if (inGreenAtDifferentIndex) grayLetters.push({letter, index: i});
        else if (!correctWord.correctWord.includes(letter)) grayLetters.push({letter, index: i});
    }

    let updatedGrid: IGrid = grid;

    // Green
    for (let g = 0; g < word.length; g++) {
        updatedGrid.grid = updatedGrid.grid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex.currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (greenLetters.some((gl: ILetter) => gl.index === tileIndex)) {
                        
                        return setGreen(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    // Yellow
    for (let y = 0; y < word.length; y++) {
        updatedGrid.grid = updatedGrid.grid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex.currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (yellowLetters.some((yl: ILetter) => yl.index === tileIndex)) {
                        
                        return setYellow(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    // Gray
    for (let g = 0; g < word.length; g++) {
        updatedGrid.grid = updatedGrid.grid.map((row: ITile[], rowIndex: number) => {
            if (rowIndex === currentRowIndex.currentRowIndex) {
                return row.map((tile: ITile, tileIndex: number) => {
                    if (grayLetters.some((grayL: ILetter) => grayL.index === tileIndex)) {
                        
                        return setGray(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    console.log('updatedGrid: ', updatedGrid);

    setGrid(updatedGrid);

    updateKeyboard(grayLetters, yellowLetters, greenLetters);
    
    
    // Set next guess
    updateGuess();
  };

  const updateGuess = (): void => {
    if ((currentRowIndex.currentRowIndex + 1) < MAX_GUESSES) {
      setCurrentRowIndex({currentRowIndex: currentRowIndex.currentRowIndex + 1});
      setCurrentTileIndex({currentTileIndex: 0});
    } else setIsGameOver({isGameOver: true});
  }

  const updateKeyboard = (grayLetters: ILetter[], yellowLetters: ILetter[], greenLetters: ILetter[]): void => {
    setKeyboard(keyboard.map((kbKey: IKeyboardKey) => {

      const inGrayLetters: boolean = grayLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);
      const inYellowLetters: boolean = yellowLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);
      const inGreenAtDifferentIndexLetters: boolean = greenLetters.some((grayL: ILetter) => grayL.letter === kbKey.key);

      const onlyInGrayLetters: boolean = inGrayLetters && !inYellowLetters && !inGreenAtDifferentIndexLetters;

      if (onlyInGrayLetters) {
        return {
          ...kbKey,
          colorClass: 'gray'
        }
      } else return kbKey;
    }))
  }

  const resetKeyboard = (): void => {
    setKeyboard(keyboard.map((kbKey: IKeyboardKey) => {
      if (kbKey.colorClass) {
        return {
          ...kbKey,
          colorClass: ''
        }
      } else return kbKey;
    }))
  }

  const getRepeatedLetters = (word: string): {[key: string] : number} => {
    const letters: string[] = Array.from(word);

    const letterCounts: {[key: string] : number} = {};

    letters.forEach((ltr: string) => {
      const letter: string = ltr.toLowerCase();
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    return letterCounts;
  };

  const setGreen = (tile: ITile): ITile => {
    return {
      ...tile,
      colorClass: COLORS.GREEN,
    };
  };
  const setYellow = (tile: ITile): ITile => {
    return {
      ...tile,
      colorClass: COLORS.YELLOW,
    };
  };
  const setGray = (tile: ITile): ITile => {
    return {
      ...tile,
      colorClass: COLORS.GRAY,
    };
  };

  const resetGame = (): void => {
    setIsGameOver({isGameOver: false});
    setCurrentRowIndex({currentRowIndex: 0});
    setCurrentTileIndex({currentTileIndex: 0});
    setFoundWord({foundWord: false});
    chooseRandomWord();
    setGrid({grid: resetGrid(MAX_GUESSES, WORD_LENGTH)});
    resetKeyboard();
  };

  const tile: ITile = {
    letter: "",
    colorClass: "",
  };

  const resetGrid = (rows: number, cols: number): ITile[][] => {
    const newGrid: ITile[][] = [];

    for (let i = 0; i < rows; i++) {
      const row: ITile[] = [];

      for (let j = 0; j < cols; j++) {
        row.push(tile);
      }

      newGrid.push(row);
    }

    return newGrid;
  };

  const chooseRandomWord = (): void => {
    const randomWord: string = WORDS[Math.floor(Math.random() * WORDS.length)];
    // const randomWord: string = "fossa";

    console.log("Word: ", randomWord);
    // console.log('Word: ', randomWord);

    setCorrectWord({correctWord: randomWord});
    // setCorrectWord(randomWord);
  };

  // Choose random word
  useEffect(() => {
    chooseRandomWord();
  }, [wordsList]);

  // Create words list
  useEffect(() => {
    createWordsList(WORDS);

    setGrid({grid: resetGrid(MAX_GUESSES, WORD_LENGTH)});

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
    if (errorMessage?.errorMessage) {
      setTimeout(() => {
        setErrorMessage({errorMessage: ""});
      }, 2000);
    }
  }, [errorMessage]);

  // Handle win
  useEffect(() => {
    if (isGameOver.isGameOver) {
      document.removeEventListener("keydown", handleKeyDown);
    } else if(!isGameOver.isGameOver) {
      document.addEventListener("keydown", handleKeyDown);
    }
  }, [isGameOver]);

  return (
    <div id="game-container">
      <h1 className="title">Wordle</h1>
      
      {errorMessage?.errorMessage && (
        <p id="message" className="message">
          {errorMessage.errorMessage}
        </p>
      )}

      <Grid grid={grid} resetGrid={() => resetGrid(MAX_GUESSES, WORD_LENGTH)} />
      
      <div className="space messages">
        {isGameOver.isGameOver && !foundWord.foundWord && (
          <>
            <p className="message green">
              The word was {correctWord.correctWord.toUpperCase()}
            </p>
            <button onClick={resetGame} id="playAgain" className="reset">
              Play again
            </button>
          </>
        )}
        {isGameOver.isGameOver && foundWord.foundWord && (
          <>
            <p className="message green">YOU WON!</p>
            <button onClick={resetGame} id="playAgain" className="reset">
              Play again
            </button>
          </>
        )}
      </div>

      <Keyboard handleKeyClick={handleKeyClick} keyboard={keyboard}/>
    </div>
  );
}
export default App;