import React, { useState, useEffect } from 'react';
import {RxCross2} from "react-icons/rx";
interface IModalProps {
    correctWord: string;
    foundWord: boolean;
    resetGame: () => void;
    setHasClosedModal: (arg: boolean) => void;
}

const Modal = ({correctWord, resetGame, foundWord, setHasClosedModal}: IModalProps) => {

    const [modalOpen, setModalOpen] = useState(false);

    const handleCloseModal = (): void => {
        setModalOpen(false);
        setHasClosedModal(true);
    }

    useEffect(() => {
        if (foundWord) {
            setTimeout(() => {
                setModalOpen(true);
            }, 2500);
        } else setModalOpen(true);
    }, [foundWord])

  return (
    <div id={modalOpen ? 'blur' : ''}>
        {modalOpen && (
            <div id='modal'>
                <h2>{foundWord ? 'AMAZING!' : 'GAME OVER'}</h2>
                <span onClick={handleCloseModal} className='icon'><RxCross2/></span>
                
                <p className="message green">
                    {foundWord
                        ? 'You found the word!'
                        : `The word was ${correctWord.toUpperCase()}`}
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