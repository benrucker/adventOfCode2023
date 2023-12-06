import { SplitStringOnce } from "../types/string/SplitString";

export function splitOnce<T extends string, D extends string>(
  string: T,
  delimiter: D,
) {
  return string.split(delimiter, 2) as SplitStringOnce<T, D>;
}
