export interface ICorrectWord {
    correctWord: string;
}

export interface IWordsList {
    [key: string] : string;
}

export interface IErrorMessage {
    errorMessage: string;
}

export interface IGameOver {
    isGameOver: boolean;
}

export interface IFoundWord {
    foundWord: boolean;
}

export interface IGrid {
    grid: ITile[][]
}

export interface IRowIndex {
    currentRowIndex: number;
}

export interface ITileIndex {
    currentTileIndex: number;
}

export interface ITile {
    letter: string;
    colorClass: string;
}

export interface ILetter {
    letter: string;
    index: number;
}

export interface ILetterWithDist extends ILetter{
    distFromCorrectIndex: number;
}

export interface ISmallestAndLargestIndexes {
    smallest: ILetter;
    largest: ILetter;
}

export interface IKeyboardKey {
    key: string;
    colorClass: string;
}