import { Solution } from "../../types/Solution";
import { Mutable } from "../../types/utility/Mutable";

const ROUND_DELIM = "; ";
const PULL_DELIM = ", ";
const GAME_DELIM = ": ";

const EMPTY_ROUND = {
  blue: 0,
  green: 0,
  red: 0,
} as const satisfies Round;

const COLORS = ["blue", "green", "red"] as const satisfies ReadonlyArray<Color>;

type GameString = `Game ${number}${typeof GAME_DELIM}${string}`;
type RoundString =
  | `${PullString}`
  | `${PullString}, ${PullString}`
  | `${PullString}, ${PullString}, ${PullString}`;
type PullString = `${number} ${Color}`;

type Game = ReadonlyArray<Round>;
interface Round {
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}
type Color = keyof Round;

const countValidGames: Solution = (untypedInput): number => {
  const input = untypedInput.split("\n") as ReadonlyArray<GameString>;
  let sumOfPowers = 0;
  for (const gameString of input) {
    const gameNumber = getGameNumber(gameString);
    const roundStrings = getRounds(gameString);
    const game = parseGame(roundStrings);
    const maxByColor = findMaxPullsOfColors(game);
    sumOfPowers += getPowerOfRound(maxByColor);
  }
  return sumOfPowers;
};

function getGameNumber(gameString: GameString): number {
  const [gameAndNumber] = splitOnce(gameString, GAME_DELIM);
  const [_, numberString] = splitOnce(gameAndNumber, " ");
  return Number(numberString);
}

function getRounds(input: GameString): ReadonlyArray<RoundString> {
  const [_, rounds] = input.split(": ");
  if (rounds == null) {
    throw new Error(`No rounds found in game ${input}`);
  }
  // Runtypes would be better here
  return rounds.split(ROUND_DELIM) as ReadonlyArray<RoundString>;
}

function parseGame(rounds: ReadonlyArray<RoundString>): Game {
  return rounds.map((roundString) => {
    const pullStrings = roundString.split(
      PULL_DELIM,
    ) as ReadonlyArray<PullString>;
    return parseRound(pullStrings);
  });
}

function findMaxPullsOfColors(game: Game): Round {
  const maxByColor: Mutable<Round> = { ...EMPTY_ROUND };
  for (const round of game) {
    for (const color of COLORS) {
      maxByColor[color] =
        round[color] > maxByColor[color] ? round[color] : maxByColor[color];
    }
  }
  return maxByColor;
}

function getPowerOfRound(round: Round) {
  let power = 1;
  for (const color of COLORS) {
    power *= round[color];
  }
  return power;
}

function parseRound(pullStrings: ReadonlyArray<PullString>): Round {
  const pull: Mutable<Round> = { ...EMPTY_ROUND };
  for (const pullString of pullStrings) {
    const [count, color] = splitOnce(pullString, " ");
    pull[color.trim() as Color] = Number(count);
  }
  return pull;
}

function splitOnce<T extends string, D extends string>(
  string: T,
  delimiter: D,
) {
  return string.split(delimiter, 2) as SplitString<T, D>;
}

type SplitString<
  T extends string,
  D extends string,
> = T extends `${infer Prefix}${D}${infer Postfix}` ? [Prefix, Postfix] : never;

export default countValidGames;
