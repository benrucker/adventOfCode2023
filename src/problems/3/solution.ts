import { EMPTY_ARRAY } from "../../constants/EmptyArray";
import { Solution } from "../../types/Solution";

interface Location {
  readonly row: number;
  readonly column: number;
}

type Schematic<Rows extends number, Columns extends number> = {
  readonly rows: Rows;
  readonly columns: Columns;
  readonly data: Matrix<Rows, Columns>;
};

type Matrix<Rows extends number, Columns extends number> = ReadonlyArray<
  SchematicRow<Columns>
> & { length: Rows };

type SchematicRow<Size extends number> = string & { length: Size };

type Character = string & { length: 1 };
type PartSymbol = Exclude<Character, `${number}` | ".">;

export const sumPartNumbers: Solution = (input: string): number => {
  const splitInput = input.split("\n");

  const firstRow = splitInput[0];
  if (firstRow == null) {
    throw new Error("Schematic is empty or malformed");
  }
  const rows = splitInput.length;
  const columns = firstRow.length;
  const schematic = {
    rows,
    columns,
    data: splitInput as Matrix<typeof rows, typeof columns>,
  };

  const partLocations = findPartLocations(schematic);

  let sum = 0;
  for (const partLocation of partLocations) {
    for (const partNumber of findPartNumbers(partLocation, schematic)) {
      sum += partNumber;
    }
  }

  return sum;
};

function findPartLocations<Rows extends number, Columns extends number>(
  schematic: Schematic<Rows, Columns>,
) {
  let output: Array<Location> = [];
  for (let rowIndex = 0; rowIndex < schematic.rows; rowIndex++) {
    const row = schematic.data[rowIndex]!;
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const char = row[colIndex]!;
      if (isPartSymbol(char)) {
        output.push({ row: rowIndex, column: colIndex });
      }
    }
  }
  return output;
}

function findPartNumbers<Rows extends number, Columns extends number>(
  partLocation: Location,
  schematic: Schematic<Rows, Columns>,
): ReadonlyArray<number> {
  // Find locations with a number
  // Coalesce horizontally
  // Expand numbers
  // Parse & return

  let numberLocations: Array<Location> = [];
  for (const neighbor of getNeighbors(partLocation, schematic)) {
    if (isNumber(schematic.data[neighbor.row]?.[neighbor.column])) {
      numberLocations.push(neighbor);
    }
  }

  const sideNeighbors = numberLocations.filter(
    ({ row, column }) =>
      column !== partLocation.column && row === partLocation.row,
  );

  const neighborsAbove = numberLocations.filter(
    ({ row }) => row === partLocation.row - 1,
  );
  const coalescedNeighborsAbove = coalesceNeighbors(neighborsAbove);

  const neighborsBelow = numberLocations.filter(
    ({ row }) => row === partLocation.row + 1,
  );
  const coalescedNeighborsBelow = coalesceNeighbors(neighborsBelow);

  const numberStartingPoints = [
    ...coalescedNeighborsAbove,
    ...sideNeighbors,
    ...coalescedNeighborsBelow,
  ];

  return parseNumbers(numberStartingPoints, schematic);
}

function parseNumbers<Rows extends number, Columns extends number>(
  numberStartingPoints: ReadonlyArray<Location>,
  schematic: Schematic<Rows, Columns>,
) {
  let numbers: Array<number> = [];
  for (const location of numberStartingPoints) {
    const row = schematic.data[location.row];
    if (row == null) {
      continue;
    }

    let leftBound = location.column;
    while (leftBound >= 0) {
      const newBound = leftBound - 1;
      if (isNumber(row[newBound])) {
        leftBound = newBound;
      } else {
        break;
      }
    }
    let rightBound = location.column;
    while (rightBound < schematic.columns) {
      const newBound = rightBound + 1;
      if (isNumber(row[newBound])) {
        rightBound = newBound;
      } else {
        break;
      }
    }

    const number = Number(row.slice(leftBound, rightBound + 1));
    numbers.push(number);
  }
  console.debug(numbers);
  return numbers;
}

function coalesceNeighbors(neighborsAbove: ReadonlyArray<Location>) {
  switch (neighborsAbove.length) {
    case 2:
      if (
        Math.abs(neighborsAbove[0]!.column - neighborsAbove[1]!.column) === 1
      ) {
        return [neighborsAbove[0]!];
      } else {
        return neighborsAbove;
      }
    case 3:
      return [neighborsAbove[0]!];
    default:
      return neighborsAbove;
  }
}

function getNeighbors<Rows extends number, Columns extends number>(
  { row, column }: Location,
  schematic: Schematic<Rows, Columns>,
) {
  return [
    ...pushIfInBounds(schematic, row - 1, column - 1),
    ...pushIfInBounds(schematic, row - 1, column),
    ...pushIfInBounds(schematic, row - 1, column + 1),
    ...pushIfInBounds(schematic, row, column - 1),
    ...pushIfInBounds(schematic, row, column + 1),
    ...pushIfInBounds(schematic, row + 1, column - 1),
    ...pushIfInBounds(schematic, row + 1, column),
    ...pushIfInBounds(schematic, row + 1, column + 1),
  ];
}

function getHorizontallyNeighboringLocations(
  locations: ReadonlyArray<Location>,
  location: Location,
) {
  let output: Array<Location> = [];
  for (const newLoc of locations) {
    if (Math.abs(newLoc.row - location.row) === 1) {
      output.push(newLoc);
    }
  }
  return output;
}

function pushIfInBounds<Rows extends number, Columns extends number>(
  { rows, columns }: Schematic<Rows, Columns>,
  row: number,
  column: number,
): [Location] | typeof EMPTY_ARRAY {
  const isValid = row >= 0 && row < rows && column >= 0 && column < columns;
  return isValid ? [{ row, column }] : EMPTY_ARRAY;
}

function isPartSymbol(string: string): string is PartSymbol {
  return isCharacter(string) && string !== "." && Number.isNaN(Number(string));
}

function isCharacter(string: string): string is Character {
  return string.length === 1;
}

function isNumber(string: string | undefined): boolean {
  return string != null && string !== "." && !Number.isNaN(Number(string));
}

export default sumPartNumbers;
