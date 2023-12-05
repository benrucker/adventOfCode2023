import { Solution } from "../../types/Solution";
import { splitOnce } from "../../utils/SplitOnce";

type CardString = `Card ${string}${number}: ${string} | ${string}`;

interface Card {
  readonly winningNumbers: ReadonlySet<number>;
  readonly drawnNumbers: ReadonlyArray<number>;
}

const countWinningPoints: Solution = (input: string): number => {
  const cardStrings = input.split("\n") as ReadonlyArray<CardString>;
  const cards = parseCards(cardStrings);

  let sum = 0;
  for (const { winningNumbers, drawnNumbers } of cards) {
    let numDrawnWinners = 0;
    for (const drawnNumber of drawnNumbers) {
      if (winningNumbers.has(drawnNumber)) {
        numDrawnWinners += 1;
      }
    }
    if (numDrawnWinners > 0) {
      sum += 2 ** (numDrawnWinners - 1);
    }
  }
  return sum;
};

function parseCards(cardStrings: ReadonlyArray<CardString>) {
  return cardStrings.map((cardString): Card => {
    const noPrefix = splitOnce(cardString, ": ")[1];
    const [winningNumbersString, drawnNumbersString] = splitOnce(
      noPrefix,
      " | ",
    );
    return {
      winningNumbers: new Set(parseNumbers(winningNumbersString)),
      drawnNumbers: parseNumbers(drawnNumbersString),
    };
  });
}

function parseNumbers(numbersString: string) {
  return numbersString
    .split(" ")
    .filter((string) => string.length > 0)
    .map((maybeNumber) => Number(maybeNumber));
}

export default countWinningPoints;
