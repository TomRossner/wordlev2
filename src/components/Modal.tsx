import React, { useState, useEffect } from 'react';
import { ICorrectWord, IFoundWord } from '../interfaces';
import {RxCross2} from "react-icons/rx";

interface IModalProps {
    correctWord: ICorrectWord;
    foundWord: IFoundWord;
    resetGame: () => void;
}

const Modal: React.FC<IModalProps> = ({correctWord, resetGame, foundWord}) => {

    const [modalOpen, setModalOpen] = useState(false);

    const handleCloseModal = (): void => {
        setModalOpen(false);
    }

    useEffect(() => {
        if (foundWord.foundWord) {
            setTimeout(() => {
                setModalOpen(true);
            }, 2500);
        } else setModalOpen(true);
    }, [foundWord])

  return (
    <div id={modalOpen ? 'blur' : ''}>
        {modalOpen && (
            <div id='modal'>
                <h2>{foundWord.foundWord ? 'AMAZING!' : 'GAME OVER'}</h2>
                <span onClick={handleCloseModal} className='icon'><RxCross2/></span>
                
                <p className="message green">
                    {foundWord.foundWord
                        ? 'You found the word!'
                        : `The word was ${correctWord.correctWord.toUpperCase()}`}
                </p>

                <button onClick={resetGame} id="playAgain" className="reset">
                    Play again
                </button>
            </div>
        )}
    </div>
  )
}

export default Modal;