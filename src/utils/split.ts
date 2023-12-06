import { SplitString } from "../types/string/SplitString";

export function split<T extends string, D extends string>(
  string: T,
  delimiter: D,
) {
  return string.split(delimiter) as SplitString<T, D>;
}
