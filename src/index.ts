import * as fs from "fs";

async function main() {
  const problemToRun = process.argv[2];

  if (Number.isNaN(Number(problemToRun))) {
    throw new Error(`Invalid problem: ${problemToRun}`);
  }

  const importPath = `problems/${problemToRun}`;
  const path = process.cwd().endsWith("src") ? importPath : `src/${importPath}`;

  if (!fs.existsSync(path)) {
    throw new Error(`Problem ${problemToRun} does not exist at path ${path}`);
  }

  const solution = await import(`./${importPath}/solution`);
  const input = fs.readFileSync(`${path}/input.txt`, "utf8");

  console.log(solution.default(input));
}

main();
