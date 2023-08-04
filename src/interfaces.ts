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
    grid: string[][]
}

export interface IRowIndex {
    currentRowIndex: number;
}

export interface ITileIndex {
    currentTileIndex: number;
}