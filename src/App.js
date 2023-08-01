import './index.scss';
import { useState, useEffect } from 'react';
import Grid from './components/Grid';
import { WORDS } from './words';
import { MAX_GUESSES, WORD_LENGTH, COLORS } from "./constants";

function App() {
  const [correctWord, setCorrectWord] = useState('');
  const [wordsList, setWordsList] = useState({});
  const [error, setError] = useState('');

  const [isGameOver, setIsGameOver] = useState(false);
  const [foundWord, setFoundWord] = useState(false);

  const [grid, setGrid] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
  ]);

  const createWordsList = (arrOfWords) => {
    const words = {};

    for (let word of arrOfWords) {
        if (!wordsList[word]) {
            words[word] = word;
        }
    }

    return setWordsList(words);
  }

  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);


  const handleKeyDown = (ev) => {
      if (/^[a-zA-Z]$/.test(ev.key) && ev.key.length === 1) {
          return addLetter(ev.key);
      } else if (ev.key.length > 1 && ev.key.toLowerCase() === 'enter' && currentTileIndex === WORD_LENGTH) {
          return checkRow(currentRowIndex);
      } else if (ev.key.length > 1 && ev.key.toLowerCase() === 'backspace') {
          return deleteLetter();
      }
  }

  const addLetter = (letter) => {

      setGrid([...grid.map((row, rowIndex) => {
          if (rowIndex === currentRowIndex) {

              return row.map((tile, tileIndex) => {
                  if (tileIndex === currentTileIndex && (currentTileIndex + 1) <= WORD_LENGTH) {
                      
                      setCurrentTileIndex(currentTileIndex + 1);
                      return {
                          ...tile,
                          letter,
                      };
                  } else return tile;
                  
              });
              
          } else return row;
      })]);
  }

  const deleteLetter = () => {
      
      return setGrid([...grid.map((row, rowIndex) => {
          if (rowIndex === currentRowIndex) {

              return row.map((tileValue, tileIndex) => {

                  if (tileIndex === currentTileIndex - 1) {
                      setCurrentTileIndex(currentTileIndex - 1);
                      return tileValue = '';
                  } else return tileValue;
                  
              });
              
          } else return row;
      })]);

  }

  const checkRow = (rowIndex) => {
      const word = grid[rowIndex].map(tile => tile.letter).join('');
      const guessedWord = word.toLowerCase();

      if (wordsList[guessedWord]) {

          if (guessedWord === correctWord) {
              // WIN
              const updatedGrid = grid.map((row, rowIdx) => {
                  if (rowIdx === currentRowIndex) {
                      return row.map((tile) => {
                          return {
                              ...tile,
                              colorClass: 'green'
                          }
                      })
                  } else return row;
              })
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
          setError('Word not in list');
      }
  }

  const checkLetters = (word) => {
      console.log(word);

      // NOTE - THERE COULD BE A MAXIMUM OF 2 DIFFERENT REPEATED LETTERS IN ONE WORD
      // EXAMPLE: KAYAK - 2 * K and 2 * A   OR   MAMAS - 2 * M and 2 * A

      // TO DO: WORDS CONTAINING 3 SAME LETTERS
      // EXAMPLE: SASSY - 3 * S

      // TRY WORDS LIKE: PSSST, ESSES, SASSY
      
      let updatedGrid = grid;

      const repeatedLettersInCorrectWord = getRepeatedLetters(correctWord);

      const greenLetters = [];

      let letters = []; // Not green

      // Set green letters
      for (let i = 0; i < word.length; i++) {

          const letterAtCurrentIndex = word[i];
          const letterInCorrectWordAtCurrentIndex = correctWord[i];

          if (letterAtCurrentIndex === letterInCorrectWordAtCurrentIndex) {

              // If letter L is already in greenLetters but at a different index, add another L with the current index

              /*  Should look like this for the word B-A-L-L-S when the correctWord is B-E-L-L-S:
      
                  Green Letters:
                  [
                    {letter: 'b', index: 0},
                    {letter: 'l', index: 2},
                    {letter: 'l', index: 3},
                    {letter: 's', index: 4}
                  ]
      
              */
              if (greenLetters.some(gl => gl.letter === letterAtCurrentIndex && gl.index !== i)) {
                  greenLetters.push({
                      letter: letterAtCurrentIndex,
                      index: i
                  })
              }
              
              // If letter L is not in greenLetters, add it
              else if (!greenLetters.filter(gl => gl.letter === letterAtCurrentIndex).length) {

                  greenLetters.push({
                      letter: letterAtCurrentIndex,
                      index: i
                  })
              }

          // If letter L is not at the right index and so not in greenLetters, but is in the repeatedLetters array,
          // add it to the letters array in order to set its color to gray or yellow after
          } else {
              letters.push({
                  letter: letterAtCurrentIndex,
                  index: i
              });
          }
      }
      
      console.log('Green Letters: ', greenLetters);
      console.log('Letters after greenLetters for loop', letters);

      // Letters that are at the wrong spot
      const lettersAtWrongSpot = letters.filter(l => correctWord.includes(l.letter));
      console.log('Wrong spot: ', lettersAtWrongSpot);

      let grayLetters = [];
      let yellowForSure = [];

      // If correctWord includes letters from letterAtWrongSpot, put them in yellowLetters after calculating closest index
      if (lettersAtWrongSpot.some(l => correctWord.includes(l.letter))) {
          const yellowLettersAfterCalc = calculateClosestIndex(correctWord, lettersAtWrongSpot);
          yellowForSure = [...yellowLettersAfterCalc];
      }

      // Letters at wrong spot could be yellow if they are repeated in the correct word
      const repeatedLettersThatShouldBeYellow = lettersAtWrongSpot.filter(letterAtWrongSpot => repeatedLettersInCorrectWord.some(repeatedLetter => repeatedLetter.letter === letterAtWrongSpot.letter));
      console.log('Repeated in correct word and should be yellow: ', repeatedLettersThatShouldBeYellow);

      // Letters that are not repeated and should be yellow --- same filter as above for repeated yellow letters, but the other way
      const notRepeatedButShouldBeYellow = lettersAtWrongSpot.filter(letterAtWrongSpot => repeatedLettersInCorrectWord.some(repeatedLetter => repeatedLetter.letter !== letterAtWrongSpot.letter));
      console.log('Not repeated in correct word but should be yellow: ', notRepeatedButShouldBeYellow);

      // Repeated letters that are not repeated in the correct word that appear yellow but should be gray AND the grayLetters that have been filtered if the greenLetters array was empty
      const repeatedInGuessedWordButShouldBeGray = [...notRepeatedButShouldBeYellow.filter(notRep => greenLetters.some(greenLetter => greenLetter.letter === notRep.letter)), ...grayLetters];
      console.log('Should be gray: ', repeatedInGuessedWordButShouldBeGray);
      
      // Letters that are yellow for sure
      yellowForSure = [...notRepeatedButShouldBeYellow.filter(notRep => greenLetters.some(greenLetter => greenLetter.letter !== notRep.letter)
          && repeatedInGuessedWordButShouldBeGray.some(repGray => repGray.letter !== notRep.letter)), ...yellowForSure];
      console.log('Yellow for sure: ', yellowForSure);


      // Letters that are not in the correct word
      grayLetters = [...repeatedInGuessedWordButShouldBeGray, ...letters.filter(l => !correctWord.includes(l.letter)), ...lettersAtWrongSpot.filter(yelForSure => greenLetters.some(greenL => greenL.letter === yelForSure.letter))];

      // Repeated letters in guessed word that are both in wrong index and are not repeated in correct word,
      // Calculate the one that is closer to the right index, and make the other one gray
      function calculateClosestIndex(correctWord, repLetters) {
        console.log(repLetters)
          if (!repLetters.length) return repLetters;
          
          const letterCounts = {};
          const duplicatedLetters = [];
          const singleLetters = [];

          repLetters.forEach(item => {
              const letter = item.letter.toLowerCase();
              letterCounts[letter] = (letterCounts[letter] || 0) + 1;
          });

          repLetters.forEach(item => {
              const letter = item.letter.toLowerCase();
              if (letterCounts[letter] > 1) {
                  duplicatedLetters.push(item);
              } else {
                  singleLetters.push(item);
              }
          });


          if (duplicatedLetters.length) {
              const letter = duplicatedLetters[0].letter;

              const indexOfLetterInGuessedWord = duplicatedLetters[0].index;
              const lastIndexOfLetterInGuessedWord = duplicatedLetters[1]?.index;

              const indexOfLetterInCorrectWord = correctWord.indexOf(letter);

              if (lastIndexOfLetterInGuessedWord) {
                  if ((indexOfLetterInCorrectWord - indexOfLetterInGuessedWord ) < (indexOfLetterInCorrectWord - lastIndexOfLetterInGuessedWord)) {

                      const result = indexOfLetterInCorrectWord - indexOfLetterInGuessedWord;

                      if (result < 0) {
                          grayLetters.push(duplicatedLetters[0]);

                          return [duplicatedLetters[1], ...singleLetters];
                      } else {
                          grayLetters.push(duplicatedLetters[1]);

                          return [duplicatedLetters[0], ...singleLetters];
                      }

                  } else {

                      const result = indexOfLetterInCorrectWord - lastIndexOfLetterInGuessedWord;

                      if (result < 0) {
                          grayLetters.push(duplicatedLetters[1]);

                          return [duplicatedLetters[0], ...singleLetters];
                      } else {
                          grayLetters.push(duplicatedLetters[0]);

                          return [duplicatedLetters[1], ...singleLetters];
                      }
                  }
              } else return [duplicatedLetters[0], ...singleLetters];
          } else if (!duplicatedLetters.length) {
              return singleLetters;
          }
          
      }

      console.log('Gray letters: ', grayLetters);
      
      const closestYellowFromNotRepeatedButYellow = calculateClosestIndex(correctWord, notRepeatedButShouldBeYellow);
      
      // Yellow letters
      const yellowLetters = [...repeatedLettersThatShouldBeYellow, ...yellowForSure].concat(...closestYellowFromNotRepeatedButYellow.some(c => greenLetters.some(gl => gl.letter === c.letter))
          ? [] : closestYellowFromNotRepeatedButYellow).filter(Boolean);
      console.log('Yellow letters: ', yellowLetters);


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

      // Yellow
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

      // Gray
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
  }

  const getRepeatedLetters = (word) => {

      const repeatedLetters = [];

      const letters = {};

      for (let i = 0; i < word.length; i++) {
          if (!letters[word[i]]) {
              letters[word[i]] = word[i];
          } else {
              repeatedLetters.push({
                  letter: word[i],
                  indexes: [
                      word.indexOf(letters[word[i]]), i
                  ]
              })
          }
      }

      return repeatedLetters;
  }



  const setGreen = (tile) => {
    return {
        ...tile,
        colorClass: COLORS.GREEN
    }   
  }
  const setYellow = (tile) => {
      return {
          ...tile,
          colorClass: COLORS.YELLOW
      }   
  }
  const setGray = (tile) => {
      return {
          ...tile,
          colorClass: COLORS.GRAY
      }   
  }



  const resetGame = () => {
    setIsGameOver(false);
    setCurrentRowIndex(0);
    setCurrentTileIndex(0);
    setFoundWord(false);
    chooseRandomWord();
    resetGrid();
  }

  const row = ["", "", "", "", ""];

  const tileObj = {
      letter: '',
      colorClass: ''
  };

  const resetGrid = () => {
    setGrid(grid.fill(row.fill(tileObj)))
  }

  const chooseRandomWord = () => {
    // const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const randomWord = 'esses';
    
    console.log('Word: ', randomWord);
    // console.log('Word: ', randomWord);

    setCorrectWord(randomWord);
    // setCorrectWord(randomWord);
  }

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
    document.addEventListener('keydown', handleKeyDown);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentTileIndex, grid]);

  // Error timeout
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError('');
      }, 2000);
    }
  }, [error]);

   // Handle win
   useEffect(() => {
    if (isGameOver && !foundWord) {
        console.log('Game over');
        document.removeEventListener('keydown', handleKeyDown);
    } else if (isGameOver && foundWord) {
        console.log('You won');
        document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isGameOver]);

  return (
    <div id='app-container'>
      <h1>Wordle</h1>

      <Grid
        grid={grid}
        resetGrid={resetGrid}
      />

      {error && (
        <p id='message' className='message'>{error}</p>
      )}

      {isGameOver && !foundWord && (
        <>
        <p className='message green'>The word was {correctWord.toUpperCase()}</p>
        <button onClick={resetGame} id='playAgain' className='reset'>Play again</button>
        </>
      )}
      {isGameOver && foundWord && (
        <>
        <p className='message green'>YOU WON!</p>
        <button onClick={resetGame} id='playAgain' className='reset'>Play again</button>
        </>
      )}
    </div>
  )
}
export default App;