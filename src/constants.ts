import { ITile, IColor } from "./interfaces";

export const WORD_LENGTH: number = 5;

export const MAX_GUESSES: number = 6;

export const LETTER_REGEX: RegExp = /^[a-zA-Z]$/;

export const TILE: ITile = {
    letter: '',
    colorClass: ''
}

export const COLORS: IColor = {
    GREEN: 'green',
    YELLOW: 'yellow',
    GRAY: 'gray',
}

export const keyboardLetters: string[] = [
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    '',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    '',
    'del',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    'enter'
]

// Audio file paths
export const winAudioFilePath: string = process.env.PUBLIC_URL + '/audio/winAudio.mp3';
export const gameOverAudioFilePath: string = process.env.PUBLIC_URL + '/audio/GameOverSound.mp3';
export const emptyAudioFilePath: string = process.env.PUBLIC_URL + '/audio/emptyAudio.mp3';
export const popAudioFilePath: string = process.env.PUBLIC_URL + '/audio/PopSound.mp3';
export const invalidAudioFilePath: string = process.env.PUBLIC_URL + '/audio/invalidAudio.mp3';

// Audio
export const winAudio: HTMLAudioElement = new Audio(winAudioFilePath);
export const gameOverAudio: HTMLAudioElement = new Audio(gameOverAudioFilePath);
export const emptyAudio: HTMLAudioElement = new Audio(emptyAudioFilePath);
export const popAudio: HTMLAudioElement = new Audio(popAudioFilePath);
export const invalidAudio: HTMLAudioElement = new Audio(invalidAudioFilePath);