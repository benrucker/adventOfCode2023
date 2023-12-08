import { Solution } from "../../types/Solution";
import { parseNumbers } from "../../utils/parseNumbers";
import { split } from "../../utils/split";

type CardString = `Card ${string}${number}: ${string} | ${string}`;

interface Card {
  readonly winningNumbers: ReadonlySet<number>;
  readonly drawnNumbers: ReadonlyArray<number>;
}

const countWinningPoints: Solution = (input: string): number => {
  const cardStrings = input.split("\n") as ReadonlyArray<CardString>;
  const cards = parseCards(cardStrings);

  const cardCounts: Array<number> = Array(cards.length).fill(1);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]!;
    const { winningNumbers, drawnNumbers } = card;
    const countOfCurrentCard = cardCounts[i]!;

    let numDrawnWinners = 0;
    for (const drawnNumber of drawnNumbers) {
      if (winningNumbers.has(drawnNumber)) {
        numDrawnWinners += 1;
      }
    }

    for (let j = 0; j < numDrawnWinners; j++) {
      cardCounts[i + j + 1] += countOfCurrentCard;
    }
  }

  return cardCounts.reduce((total, count) => total + count, 0);
};

function parseCards(cardStrings: ReadonlyArray<CardString>) {
  return cardStrings.map((cardString): Card => {
    const noPrefix = split(cardString, ": ")[1];
    const [winningNumbersString, drawnNumbersString] = split(noPrefix, " | ");
    return {
      winningNumbers: new Set(parseNumbers(winningNumbersString)),
      drawnNumbers: parseNumbers(drawnNumbersString),
    };
  });
}

export default countWinningPoints;
