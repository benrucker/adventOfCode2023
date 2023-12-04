import * as fs from "fs";

const FILE_PATH = "lastRunProblem.temp";

export function getLastRunProblem() {
  if (!fs.existsSync(FILE_PATH)) {
    return null;
  }

  return fs.readFileSync(FILE_PATH, "utf-8");
}

export function writeLastRunProblem(problem: string) {
  fs.writeFileSync(FILE_PATH, problem);
}
