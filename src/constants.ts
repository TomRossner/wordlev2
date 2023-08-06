export const WORD_LENGTH: number = 5;

export const MAX_GUESSES: number = 6;

export const COLORS: IColors = {
    GREEN: 'green',
    YELLOW: 'yellow',
    GRAY: 'gray',
}
interface IColors {
    GREEN: string;
    YELLOW: string;
    GRAY: string;
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

const winAudioFilePath: string = process.env.PUBLIC_URL + '/audio/winAudio.mp3';
const gameOverAudioFilePath: string = process.env.PUBLIC_URL + '/audio/GameOverSound.mp3';
const emptyAudioFilePath: string = process.env.PUBLIC_URL + '/audio/emptyAudio.mp3';
export const popAudioFilePath: string = process.env.PUBLIC_URL + '/audio/PopSound.mp3';
const shakeAudioFilePath: string = process.env.PUBLIC_URL + '/audio/ShakeSound.mp3';
const invalidAudioFilePath: string = process.env.PUBLIC_URL + '/audio/invalidAudio.mp3';

export const winAudio: HTMLAudioElement = new Audio(winAudioFilePath);
export const gameOverAudio: HTMLAudioElement = new Audio(gameOverAudioFilePath);
export const emptyAudio: HTMLAudioElement = new Audio(emptyAudioFilePath);
export const popAudio: HTMLAudioElement = new Audio(popAudioFilePath);
export const shakeAudio: HTMLAudioElement = new Audio(shakeAudioFilePath);
export const invalidAudio: HTMLAudioElement = new Audio(invalidAudioFilePath);