export const DIGITS = {
  one: "one",
  two: "two",
  three: "three",
  four: "four",
  five: "five",
  six: "six",
  seven: "seven",
  eight: "eight",
  nine: "nine",
} as const;
export type EnglishDigit = (typeof DIGITS)[keyof typeof DIGITS];

export const DIGIT_BY_STRING = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
} as const;
export type NumericDigit =
  (typeof DIGIT_BY_STRING)[keyof typeof DIGIT_BY_STRING];
