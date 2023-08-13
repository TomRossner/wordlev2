export interface ITile {
    letter: string;
    colorClass: string;
    delay?: number | undefined
}

export interface ILetter {
    letter: string;
    index: number;
}

export interface ILetterWithDist extends ILetter{
    distFromCorrectIndex: number;
    distFromCorrectLastIndex: number;
}

export interface ISmallestAndLargestIndexes {
    smallest: ILetter;
    largest: ILetter;
}

export interface IKeyboardKey {
    key: string;
    colorClass: string;
}

export interface IOccurrence {
    [key: string]: number;
}

export interface IColor {
    [key: string]: string;
}