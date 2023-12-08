import { SplitString } from "../types/string/SplitString";
import { split } from "./split";

export function parseNumbers(numbersString: string, delimiter: string = " ") {
  return split(numbersString, delimiter)
    .filter((string) => string.length > 0)
    .map((maybeNumber) => Number(maybeNumber));
}
