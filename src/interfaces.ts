export interface ICorrectWord {
    correctWord: string;
}

export interface IWordsList {
    wordsList: object;
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

export interface ISmallestAndSlargestIndexes {
    smallest: ILetter;
    largest: ILetter;
}