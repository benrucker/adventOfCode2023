import { getLastRunProblem } from "./lastRunProblem";
import * as path from "path";

const FS_DELIM = path.sep;

const SRC_PROBLEMS = path.join("src", "problems") + FS_DELIM;

export function getProblemToRun(inputArg: string | undefined): string {
  inputArg = inputArg?.replace(/\\\\/g, "\\");

  if (inputArg != null && inputArg.startsWith(SRC_PROBLEMS)) {
    return inputArg.slice(inputArg.lastIndexOf(FS_DELIM) + 1);
  }

  if (inputArg != null && !Number.isNaN(Number(inputArg))) {
    return inputArg;
  }

  const lastRunProblem = getLastRunProblem();

  if (lastRunProblem != null) {
    console.warn(`Falling back to problem ${lastRunProblem}`);
    return lastRunProblem;
  }

  throw new Error(`Invalid problem: ${inputArg}`);
}
