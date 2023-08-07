import React from 'react';
import { IKeyboardKey } from '../interfaces';

interface KeyboardProps {
    keyboard: IKeyboardKey[];
    handleKeyClick: (letter: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({keyboard, handleKeyClick}) => {
  return (
    <div id='keyboard' className='keyboard'>
        {keyboard.map((keyboardKey: IKeyboardKey, keyIndex: number) => {
            return keyboardKey.key === ''
                ? (
                    <div key={keyIndex} className='keyboard-space'></div>
                )
                : (
                    <div
                        key={keyIndex}
                        onClick={() => handleKeyClick(keyboardKey.key)}
                        className={`${keyboardKey.key.length > 1 ? 'kb-button large' : 'kb-button'} ${keyboardKey.colorClass}`}
                    >{keyboardKey.key}</div>
                )
        })}
    </div>
  )
}

export default Keyboard;