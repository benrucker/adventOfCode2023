import { getLastRunProblem } from "./lastRunProblem";

export function getProblemToRun(inputArg: string | undefined): string {
  if (inputArg != null && inputArg.startsWith("src/problems/")) {
    return inputArg.slice(inputArg.lastIndexOf("/") + 1);
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
