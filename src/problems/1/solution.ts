import * as fs from "fs";

const DIGITS = {
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
type StringDigit = (typeof DIGITS)[keyof typeof DIGITS];

const DIGIT_BY_STRING = {
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

const numStrings = new RegExp(
  `(?=(${[
    ...Object.keys(DIGIT_BY_STRING),
    ...Object.values(DIGIT_BY_STRING),
  ].join("|")}))`,
  "g",
);

export function sumCalibration(input: string) {
  fs.writeFileSync("output.temp", "");
  const lines = input.split("\n");

  let sum = 0;
  for (const line of lines) {
    const nums = Array.from(line.matchAll(numStrings));

    if (nums == null) {
      throw new Error(`No numbers found in calibration string: ${line}`);
    }

    const firstNumString = nums[0]?.[1];
    const lastNumString = nums[nums.length - 1]?.[1];

    if (firstNumString == null || lastNumString == null) {
      throw new Error("No numbers found in calibration string");
    }

    const firstNum = convertNumber(firstNumString);
    const lastNum = convertNumber(lastNumString);

    sum += 10 * firstNum + lastNum;

    fs.appendFileSync(
      "output.temp",
      `${line}: ${firstNumString} ${firstNum} ${lastNumString} ${lastNum} - ${nums}\n`,
    );
  }

  return sum;
}

function convertNumber(stringNum: string): number {
  if (isStringDigit(stringNum)) {
    return DIGIT_BY_STRING[stringNum];
  }
  const number = Number(stringNum);
  if (Number.isNaN(number)) {
    throw new Error(`Could not convert ${stringNum} to number`);
  }
  return number;
}

function isStringDigit(string: string): string is StringDigit {
  return Object.keys(DIGITS).includes(string);
}

export default sumCalibration;
