import "./index.scss";
import { useState, useEffect } from "react";
import Grid from "./components/Grid";
import { WORDS } from "./words";
import { MAX_GUESSES, WORD_LENGTH, COLORS } from "./constants";

function App() {
  const [correctWord, setCorrectWord] = useState("");
  const [wordsList, setWordsList] = useState({});
  const [error, setError] = useState("");

  const [isGameOver, setIsGameOver] = useState(false);
  const [foundWord, setFoundWord] = useState(false);

  const [grid, setGrid] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);

  const createWordsList = (arrOfWords) => {
    const words = {};

    for (let word of arrOfWords) {
      if (!wordsList[word]) {
        words[word] = word;
      }
    }

    return setWordsList(words);
  };

  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);

  const handleKeyDown = (ev) => {
    if (/^[a-zA-Z]$/.test(ev.key) && ev.key.length === 1) {
      return addLetter(ev.key);
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "enter") {
      return handleEnterKey();
    } else if (ev.key.length > 1 && ev.key.toLowerCase() === "backspace") {
      return deleteLetter();
    }
  };

  const handleEnterKey = () => {
    if (currentTileIndex === WORD_LENGTH) {
      return checkRow(currentRowIndex);
    } else if (currentTileIndex < WORD_LENGTH) {
      return setError("Too short");
    }
  };

  const addLetter = (letter) => {
    setGrid([
      ...grid.map((row, rowIndex) => {
        if (rowIndex === currentRowIndex) {
          return row.map((tile, tileIndex) => {
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

  const deleteLetter = () => {
    return setGrid([
      ...grid.map((row, rowIndex) => {
        if (rowIndex === currentRowIndex) {
          return row.map((tileValue, tileIndex) => {
            if (tileIndex === currentTileIndex - 1) {
              setCurrentTileIndex(currentTileIndex - 1);
              return (tileValue = "");
            } else return tileValue;
          });
        } else return row;
      }),
    ]);
  };

  const checkRow = (rowIndex) => {
    const word = grid[rowIndex].map((tile) => tile.letter).join("");
    const guessedWord = word.toLowerCase();

    if (wordsList[guessedWord]) {
      if (guessedWord === correctWord) {
        // WIN
        const updatedGrid = grid.map((row, rowIdx) => {
          if (rowIdx === currentRowIndex) {
            return row.map((tile) => {
              return {
                ...tile,
                colorClass: "green",
              };
            });
          } else return row;
        });
        setGrid(updatedGrid);

        setIsGameOver(true);
        setFoundWord(true);
        return;
      } else {
        return checkLetters(guessedWord);
      }
    } else {
      // Word not in list
      console.log(`The word '${guessedWord}' does not exist`);
      setError("Word not in list");
    }
  };

  const checkLetters = (word) => {
    const lettersOccurrencesInCorrectWord = getRepeatedLetters(correctWord);
    const lettersOccurrencesInGuessedWord = getRepeatedLetters(word);
    console.log("Correct word letters: ", lettersOccurrencesInCorrectWord);
    console.log("Guessed word letters: ", lettersOccurrencesInGuessedWord);

    const greenLetters = [];

    const notGreenLetters = [];

    let yellowLetters = [];

    const grayLetters = [];

    for (let i = 0; i < word.length; i++) {
      const letterAtCurrentIndex = word[i];
      const letterInCorrectWordAtCurrentIndex = correctWord[i];

      if (letterAtCurrentIndex === letterInCorrectWordAtCurrentIndex) {
        if (greenLetters.some(gl => gl.letter === letterAtCurrentIndex && gl.index !== i)) {
          greenLetters.push({
            letter: letterAtCurrentIndex,
            index: i,
          });
        }

        // If letter L is not in greenLetters, add it
        else if (!greenLetters.filter((gl) => gl.letter === letterAtCurrentIndex).length) {
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

        const numOfGreens = greenLetters.filter(gLetter => gLetter.letter === letter).length;
        // console.log(`Num of green ${letter}: `, numOfGreens);

        const numOfOccurrencesInCorrectWord = lettersOccurrencesInCorrectWord[letter] || 0;
        //   console.log("Occurrences in correct word: ", numOfOccurrencesInCorrectWord);
            
        const numOfYellows = numOfOccurrencesInCorrectWord - numOfGreens;
        console.log(`Num of yellow ${letter}: `, numOfYellows);

        const inGreen = greenLetters.some(gLetter => gLetter.letter === letter && gLetter.index !== i);
        //   console.log(`${letter} at index ${i} is in green letters ? `, inGreen);

        if (numOfYellows && !inGreen) {
            yellowLetters.push({letter, index: i});

            if ((yellowLetters.filter(yel => yel.letter === letter).length === lettersOccurrencesInGuessedWord[letter]) && (lettersOccurrencesInGuessedWord[letter] >= 2)) {
                const duplicatedLetters = yellowLetters.filter(yel => yel.letter === letter);
    
                // Calculate closest index
                const calculateClosestIndex = (correctWord, letters) => {
                    const correctLetterIndex = correctWord.indexOf(letter);  
                    console.log(letters)
    
                    const mapIndexesMinusCorrectLetterIndex = letters.map(dupL => {
                        return {
                            ...dupL,
                            distFromCorrectIndex: dupL.index - correctLetterIndex
                        }
                    });
    
    
                    const smallestIndex = Math.min(...mapIndexesMinusCorrectLetterIndex.map(m => m.distFromCorrectIndex));
                    const largestIndex = Math.max(...mapIndexesMinusCorrectLetterIndex.map(m => m.distFromCorrectIndex));
    
                    const yellowLetter = mapIndexesMinusCorrectLetterIndex.find(l => l.distFromCorrectIndex === smallestIndex);
                    const grayLetter = mapIndexesMinusCorrectLetterIndex.find(l => l.distFromCorrectIndex === largestIndex);
    
                    
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
    
                const letterAtClosestIndex = calculateClosestIndex(correctWord, duplicatedLetters).smallest;
                
                const letterAtFarthestIndex = calculateClosestIndex(correctWord, duplicatedLetters).largest;
                // console.log(calculateClosestIndex(correctWord, [{letter: 's', index: 1},{letter: 's', index: 1}, {letter: 's', index: 4}]))
                grayLetters.push(...yellowLetters.filter(yel => yel.letter === letter && yel.index !== letterAtClosestIndex.index));
    
                const updatedYellowLetters = [...yellowLetters.filter(yel => yel.letter !== letter), letterAtClosestIndex];
    
                yellowLetters = [...updatedYellowLetters];
            }
        }

        else if (inGreen) grayLetters.push({letter, index: i});
        else if (!correctWord.includes(letter)) grayLetters.push({letter, index: i});
    }

    console.log("Yellow letters: ", yellowLetters);
    console.log("Gray letters: ", grayLetters);

    let updatedGrid = grid;

    // Green
    for (let g = 0; g < word.length; g++) {
        updatedGrid = updatedGrid.map((row, rowIndex) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile, tileIndex) => {
                    if (greenLetters.some(gl => gl.index === tileIndex)) {
                        
                        return setGreen(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    // // Yellow
    for (let y = 0; y < word.length; y++) {
        updatedGrid = updatedGrid.map((row, rowIndex) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile, tileIndex) => {
                    if (yellowLetters.some(yl => yl.index === tileIndex)) {
                        
                        return setYellow(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    // // Gray
    for (let g = 0; g < word.length; g++) {
        updatedGrid = updatedGrid.map((row, rowIndex) => {
            if (rowIndex === currentRowIndex) {
                return row.map((tile, tileIndex) => {
                    if (grayLetters.some(grayL => grayL.index === tileIndex)) {
                        
                        return setGray(tile);
                    } else return tile;
                })
            } else return row;
        })
    }

    console.log('updatedGrid: ', updatedGrid);

    setGrid(updatedGrid);
    
    
    // Set next guess
    if ((currentRowIndex + 1) < MAX_GUESSES) {
        setCurrentRowIndex(currentRowIndex + 1);
        setCurrentTileIndex(0);
    } else setIsGameOver(true);
  };

  const getRepeatedLetters = (word) => {
    const letters = Array.from(word);

    const letterCounts = {};

    letters.forEach((ltr) => {
      const letter = ltr.toLowerCase();
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    return letterCounts;
  };

  const setGreen = (tile) => {
    return {
      ...tile,
      colorClass: COLORS.GREEN,
    };
  };
  const setYellow = (tile) => {
    return {
      ...tile,
      colorClass: COLORS.YELLOW,
    };
  };
  const setGray = (tile) => {
    return {
      ...tile,
      colorClass: COLORS.GRAY,
    };
  };

  const resetGame = () => {
    setIsGameOver(false);
    setCurrentRowIndex(0);
    setCurrentTileIndex(0);
    setFoundWord(false);
    chooseRandomWord();
    resetGrid();
  };

  const row = ["", "", "", "", ""];

  const tileObj = {
    letter: "",
    colorClass: "",
  };

  const resetGrid = () => {
    setGrid(grid.fill(row.fill(tileObj)));
  };

  const chooseRandomWord = () => {
    // const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const randomWord = "sport";

    console.log("Word: ", randomWord);
    // console.log('Word: ', randomWord);

    setCorrectWord(randomWord);
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
    if (error) {
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  }, [error]);

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
