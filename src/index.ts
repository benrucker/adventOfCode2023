import * as fs from "fs";
import { getIsDemoMode } from "./runner/getIsDemoMode";
import { getProblemToRun } from "./runner/getProblemToRun";
import { writeLastRunProblem } from "./runner/lastRunProblem";

const INPUT_FILENAME = "input.txt";
const DEMO_FILENAME = "demo.txt";

async function main() {
  const problemToRun = getProblemToRun(process.argv[2]);
  const isDemoMode = getIsDemoMode(process.argv[3]);

  const importPath = `problems/${problemToRun}`;
  const path = process.cwd().endsWith("src") ? importPath : `src/${importPath}`;

  if (!fs.existsSync(path)) {
    throw new Error(`Problem ${problemToRun} does not exist at path ${path}`);
  }

  writeLastRunProblem(problemToRun);

  const solution = await import(`./${importPath}/solution`);
  const inputFilename = isDemoMode ? DEMO_FILENAME : INPUT_FILENAME;
  const input = fs.readFileSync(`${path}/${inputFilename}`, "utf8");

  console.log(solution.default(input));
}

main();
