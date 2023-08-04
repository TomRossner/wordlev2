import "./index.scss";
import { useState, useEffect } from "react";
import Grid from "./components/Grid";
import { WORDS } from "./words";
import { MAX_GUESSES, WORD_LENGTH, COLORS } from "./constants";
import { ICorrectWord, IErrorMessage, IFoundWord, IGameOver, IGrid, ILetter, ILetterWithDist, IRow, IRowIndex, ISmallestAndSlargestIndexes, ITile, ITileIndex, IWordsList } from "./interfaces";

function App() {
  const [correctWord, setCorrectWord] = useState<ICorrectWord>({correctWord: ""});
  const [wordsList, setWordsList] = useState<IWordsList>({wordsList: {}});
  const [errorMessage, setErrorMessage] = useState<IErrorMessage | null>(null);

  const [isGameOver, setIsGameOver] = useState<IGameOver>({isGameOver: false});
  const [foundWord, setFoundWord] = useState<IFoundWord>({foundWord: false});

  const [grid, setGrid] = useState<IGrid>({grid: []});

  const createWordsList = (arrOfWords: string[]) => {
    const words: object = {};

    for (let word of arrOfWords) {
      if (!wordsList[word]) {
        words[word] = word;
      }
    }

    return setWordsList({wordsList: words});
  };

  const [currentRowIndex, setCurrentRowIndex] = useState<IRowIndex>({currentRowIndex: 0});
  const [currentTileIndex, setCurrentTileIndex] = useState<ITileIndex>({currentTileIndex: 0});

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(ev.key) && ev.key.length === 1) {
      return addLetter(ev.key);
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "backspace") {
      return deleteLetter();
    }
  };

  const handleEnterKey = () => {
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

  const checkRow = (rowIndex: number) => {
    const word = grid[rowIndex].map((tile: ITile) => tile.letter).join("");
    const guessedWord = word.toLowerCase();

    if (wordsList[guessedWord]) {
      if (guessedWord === correctWord) {
        // WIN
        const updatedGrid = grid.grid.map((row: ITile[], rowIdx: number) => {
          if (rowIdx === currentRowIndex.currentRowIndex) {
            return row.map((tile: ITile) => setGreen(tile));
          } else return row;
        });
        setGrid({grid: updatedGrid});

        setIsGameOver({isGameOver: true});
        setFoundWord({foundWord: true});
        return;
      } else {
        return checkLetters(guessedWord);
      }
    } else {
      // Word not in list
      console.log(`The word '${guessedWord}' does not exist`);
      setErrorMessage({errorMessage: "Word not in list"});
    }
  };

  const checkLetters = (word: string) => {
    const lettersOccurrencesInCorrectWord = getRepeatedLetters(correctWord);
    const lettersOccurrencesInGuessedWord = getRepeatedLetters(word);
    console.log("Correct word letters: ", lettersOccurrencesInCorrectWord);
    console.log("Guessed word letters: ", lettersOccurrencesInGuessedWord);

    const greenLetters: ILetter[] = [];

    const notGreenLetters: ILetter[] = [];

    let yellowLetters: ILetter[] = [];

    const grayLetters: ILetter[] = [];

    for (let i = 0; i < word.length; i++) {
      const letterAtCurrentIndex = word[i];
      const letterInCorrectWordAtCurrentIndex = correctWord[i];

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

    console.log("GreenLetters: ", greenLetters);
    console.log("Not green letters: ", notGreenLetters);

    for (let i = 0; i < word.length; i++) {
        const letter = word[i];

        const numOfGreens = greenLetters.filter((gLetter: ILetter) => gLetter.letter === letter).length;
        // console.log(`Num of green ${letter}: `, numOfGreens);

        const numOfOccurrencesInCorrectWord = lettersOccurrencesInCorrectWord[letter] || 0;
        //   console.log("Occurrences in correct word: ", numOfOccurrencesInCorrectWord);
            
        const numOfYellows = numOfOccurrencesInCorrectWord - numOfGreens;
        console.log(`Num of yellow ${letter}: `, numOfYellows);

        const inGreen = greenLetters.some((gLetter: ILetter) => gLetter.letter === letter && gLetter.index !== i);
        //   console.log(`${letter} at index ${i} is in green letters ? `, inGreen);

        if (numOfYellows && !inGreen) {
            yellowLetters.push({letter, index: i});

            if ((yellowLetters.filter((yel: ILetter) => yel.letter === letter).length === lettersOccurrencesInGuessedWord[letter]) && (lettersOccurrencesInGuessedWord[letter] >= 2)) {
                const duplicatedLetters = yellowLetters.filter((yel: ILetter) => yel.letter === letter);
    
                // Calculate closest index
                const calculateClosestIndex = (correctWord: string, letters: ILetter[]) : ISmallestAndSlargestIndexes => {
                    const correctLetterIndex = correctWord.indexOf(letter);  
                    console.log(letters)
    
                    const mapIndexesMinusCorrectLetterIndex = letters.map((dupL: ILetter) => {
                        return {
                            ...dupL,
                            distFromCorrectIndex: dupL.index - correctLetterIndex
                        }
                    });
    
    
                    const smallestIndex = Math.min(...mapIndexesMinusCorrectLetterIndex.map((m: ILetterWithDist) => m.distFromCorrectIndex));
                    const largestIndex = Math.max(...mapIndexesMinusCorrectLetterIndex.map((m: ILetterWithDist) => m.distFromCorrectIndex));
    
                    const yellowLetter = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l.distFromCorrectIndex === smallestIndex);
                    const grayLetter = mapIndexesMinusCorrectLetterIndex.find((l: ILetterWithDist) => l.distFromCorrectIndex === largestIndex);
    
                    
                    return {
                        smallest: {
                            letter: yellowLetter.letter,
                            index: yellowLetter.index
                        },
                        largest: {
                            letter: grayLetter.letter,
                            index: grayLetter.index
                        }
                    }
                }
    
                const letterAtClosestIndex = calculateClosestIndex(correctWord.correctWord, duplicatedLetters).smallest;
                
                const letterAtFarthestIndex = calculateClosestIndex(correctWord.correctWord, duplicatedLetters).largest;
                // console.log(calculateClosestIndex(correctWord, [{letter: 's', index: 1},{letter: 's', index: 1}, {letter: 's', index: 4}]))
                grayLetters.push(...yellowLetters.filter((yel: ILetter) => yel.letter === letter && yel.index !== letterAtClosestIndex.index));
    
                const updatedYellowLetters = [...yellowLetters.filter((yel: ILetter) => yel.letter !== letter), letterAtClosestIndex];
    
                yellowLetters = [...updatedYellowLetters];
            }
        }

        else if (inGreen) grayLetters.push({letter, index: i});
        else if (!correctWord.correctWord.includes(letter)) grayLetters.push({letter, index: i});
    }

    console.log("Yellow letters: ", yellowLetters);
    console.log("Gray letters: ", grayLetters);

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

    // // Yellow
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

    // // Gray
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
    
    
    // Set next guess
    if ((currentRowIndex.currentRowIndex + 1) < MAX_GUESSES) {
        setCurrentRowIndex({currentRowIndex: currentRowIndex.currentRowIndex + 1});
        setCurrentTileIndex({currentTileIndex: 0});
    } else setIsGameOver({isGameOver: true});
  };

  const getRepeatedLetters = (word: string): object => {
    const letters: string[] = Array.from(word);

    const letterCounts: object = {};

    letters.forEach((ltr: string) => {
      const letter = ltr.toLowerCase();
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
    resetGrid();
  };

  const tileObj: ITile = {
    letter: "",
    colorClass: "",
  };

  const row: ITile[] = [
    tileObj,
    tileObj,
    tileObj,
    tileObj,
    tileObj
  ];


  const resetGrid = () => {
    setGrid(grid.grid.fill(row.fill(tileObj)));
  };

  const chooseRandomWord = () => {
    const randomWord: string = WORDS[Math.floor(Math.random() * WORDS.length)];
    // const randomWord = "sport";

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
  }, []);

  // Add keydown event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentTileIndex, grid]);

  // Error timeout
  useEffect(() => {
    if (errorMessage.errorMessage) {
      setTimeout(() => {
        setErrorMessage({errorMessage: ""});
      }, 2000);
    }
  }, [errorMessage]);

  // Handle win
  useEffect(() => {
    // if (isGameOver && !foundWord) {
    //     document.removeEventListener('keydown', handleKeyDown);
    // } else if (isGameOver && foundWord) {
    //     document.removeEventListener('keydown', handleKeyDown);
    // }
    if (isGameOver) {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isGameOver]);

  return (
    <div id="app-container">
      <h1>Wordle</h1>

      <Grid grid={grid} resetGrid={resetGrid} />

      {error && (
        <p id="message" className="message">
          {error}
        </p>
      )}

      {isGameOver && !foundWord && (
        <>
          <p className="message green">
            The word was {correctWord.toUpperCase()}
          </p>
          <button onClick={resetGame} id="playAgain" className="reset">
            Play again
          </button>
        </>
      )}
      {isGameOver && foundWord && (
        <>
          <p className="message green">YOU WON!</p>
          <button onClick={resetGame} id="playAgain" className="reset">
            Play again
          </button>
        </>
      )}
    </div>
  );
}
export default App;
