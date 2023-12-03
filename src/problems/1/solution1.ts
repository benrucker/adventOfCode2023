export function sumCalibration(input: string) {
  const lines = input.split("\n");

  let sum = 0;
  for (const line of lines) {
    let firstNum: number | null = null;
    let lastNum = 0;

    for (const char of line) {
      const maybeNum = Number(char);
      if (!Number.isNaN(maybeNum)) {
        firstNum ??= maybeNum;
        lastNum = maybeNum;
      }
    }

    if (firstNum == null) {
      throw new Error("No numbers found in calibration string");
    }

    sum += 10 * firstNum + lastNum;
  }

  return sum;
}

export default sumCalibration;
