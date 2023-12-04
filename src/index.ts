import * as fs from "fs";
import { getProblemToRun } from "./runner/getProblemToRun";
import { writeLastRunProblem } from "./runner/lastRunProblem";

async function main() {
  const problemToRun = getProblemToRun(process.argv[2]);

  const importPath = `problems/${problemToRun}`;
  const path = process.cwd().endsWith("src") ? importPath : `src/${importPath}`;

  if (!fs.existsSync(path)) {
    throw new Error(`Problem ${problemToRun} does not exist at path ${path}`);
  }

  writeLastRunProblem(problemToRun);

  const solution = await import(`./${importPath}/solution`);
  const input = fs.readFileSync(`${path}/input.txt`, "utf8");

  console.log(solution.default(input));
}

main();
