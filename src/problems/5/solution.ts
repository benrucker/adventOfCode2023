import { Solution } from "../../types/Solution";
import { parseNumbers } from "../../utils/parseNumbers";
import { split } from "../../utils/split";

type SeedsInputString = `seeds: ${string}`;

type MapInputString = `${string}-to-${string} map:`;
type ValuesInputString = `${number} ${number} ${number}`;

interface WithValueAndRange {
  readonly value: number;
  readonly range: number;
}

interface Map {
  readonly keyName: string;
  readonly valueName: string;
  readonly keys: ReadonlyArray<number>;
  readonly valueAndRangeByKey: Record<number, WithValueAndRange>;
}

type MapByMapName = Record<string, Map>;

const findLowestLocation: Solution = (input): number => {
  const lines = input.split("\n");
  const seedsString = split(lines[0]! as SeedsInputString, ": ")[1];

  const seedPairs = parseNumbers(seedsString);
  const seeds = unrollSeedPairs(seedPairs);

  const mapByMapName: MapByMapName = {};

  let currentKeyString: string | undefined;
  let currentValueString: string | undefined;
  let currentValueByKey: Record<number, WithValueAndRange> | undefined;
  for (const line of lines.slice(2).concat([""])) {
    if (line.length === 0) {
      // stop parsing
      const map: Map = {
        keyName: currentKeyString!,
        valueName: currentValueString!,
        // Keys of currentValueByKey are sorted because the runtime
        // models it as a sparse array
        keys: Object.keys(currentValueByKey!).map(Number),
        valueAndRangeByKey: currentValueByKey!,
      };
      mapByMapName[currentKeyString!] = map;
      currentKeyString = undefined;
      currentValueString = undefined;
      currentValueByKey = undefined;
    } else if (line.endsWith("map:")) {
      const mapString = line.trim() as MapInputString;
      const [pairString] = split(mapString, " ");
      [currentKeyString, currentValueString] = split(pairString, "-to-");
    } else {
      // line is a values triplet
      const valuesString = line.trim() as ValuesInputString;
      const [value, key, range] = parseNumbers(valuesString);
      if (key == null || value == null || range == null) {
        throw new Error("Malformed almanac line: " + line);
      }
      currentValueByKey ??= {};
      currentValueByKey[key] = { value, range };
    }
  }

  let nextValues = findValidLocations(seeds, mapByMapName);
  console.log(nextValues);

  return Math.min(...nextValues);
};

function findValidLocations(seeds: number[], mapByMapName: MapByMapName) {
  let nextMapName = "seed";
  let nextValues: ReadonlyArray<number> = seeds;
  while (true) {
    const map = getNextMap(mapByMapName, nextMapName);
    const nextNameToProcess = map.valueName;

    nextValues = findNextValues(map, nextValues);

    if (nextNameToProcess === "location") {
      break;
    }

    nextMapName = nextNameToProcess;
  }
  return nextValues;
}

function getNextMap(mapByMapName: MapByMapName, mapName: string) {
  const map = mapByMapName[mapName];

  if (map == null) {
    throw new Error(`Could not find ${mapName} map`);
  }

  return map;
}

function findNextValues(map: Map, inputKeys: ReadonlyArray<number>) {
  let nextValues: Array<number> = [];

  for (const inputKey of inputKeys) {
    nextValues.push(getNextValue(inputKey, map));
  }

  return nextValues;
}

function getNextValue(inputKey: number, map: Map) {
  let maxKey = -1;
  for (const key of map.keys) {
    if (key > inputKey) {
      break;
    }
    maxKey = key;
  }

  if (maxKey === -1) {
    return inputKey;
  }

  const { value, range } = map.valueAndRangeByKey[maxKey]!;

  const difference = inputKey - maxKey;

  // Range specifies an exclusive upper bound
  // e.g. value: 50, range: 3
  // -> 50, 51, 52
  // 53 is not included
  const maxValue = value + range - 1;

  const nextValue = value + difference;

  if (nextValue > maxValue) {
    return inputKey;
  }

  return nextValue;
}

function unrollSeedPairs(seedPairs: ReadonlyArray<number>) {
  let seeds = [...seedPairs];
  let output: Array<number> = [];
  while (seeds.length > 0) {
    const [seed, range] = seeds.slice(0, 2);
    if (seed == null || range == null) {
      throw new Error("Could not read seed input");
    }
    output = output.concat(parseSeedPair(seed, range));
    seeds = seeds.slice(2);
  }
  return output;
}

function parseSeedPair(seed: number, range: number) {
  let seedNum = seed;
  let output: Array<number> = [];
  for (let i = 0; i < range; i++) {
    output.push(seedNum + i);
  }
  return output;
}

export default findLowestLocation;
