import { Solution } from "../../types/Solution";
import { Mutable } from "../../types/utility/Mutable";
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

interface Range {
  readonly start: number;
  /**
   * The end of the range, EXCLUSIVE;
   */
  readonly end: number;
}

const findLowestLocation: Solution = (input): number => {
  const lines = input.split("\n");
  const seedsString = split(lines[0]! as SeedsInputString, ": ")[1];

  const flatSeedNums = parseNumbers(seedsString);
  const seedPairs = getSeedPairs(flatSeedNums);
  const seedRanges = getSeedRanges(seedPairs);

  const mapByMapName = parseMaps(lines);

  let nextValues = findValidLocations(seedRanges, mapByMapName);

  return Math.min(...nextValues.map(({ start }) => start));
};

function parseMaps(lines: string[]) {
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

  return mapByMapName;
}

function findValidLocations(
  seedRanges: ReadonlyArray<Range>,
  mapByMapName: MapByMapName,
) {
  let nextMapName = "seed";
  let nextValues: ReadonlyArray<Range> = seedRanges;
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

function findNextValues(map: Map, inputKeys: ReadonlyArray<Range>) {
  const nextRanges: Array<Range> = [];

  for (const inputKey of inputKeys) {
    nextRanges.push(...getNextRanges(inputKey, map));
  }

  return nextRanges;
}

function getNextRanges(inputRange: Range, map: Map): ReadonlyArray<Range> {
  const rangeLeft: Mutable<Range> = {
    ...inputRange,
  };

  const output: Array<Range> = [];

  // range: { start, end }
  // while the input range start < end
  while (rangeLeft.start < rangeLeft.end) {
    const keyRangeStart = getKeyRangeStart(rangeLeft.start, map);
    const keyRangeEnd = getKeyRangeEnd(keyRangeStart, map);
    const outputRangeEnd = Math.min(keyRangeEnd, rangeLeft.end);

    const valueRange = {
      start: getValue(keyRangeStart.rangeStart, map),
      end: getValue(outputRangeEnd, map),
    };
    output.push(valueRange);

    console.log(`rangeLeft: ${rangeLeft.start} ${rangeLeft.end}`);
    console.log(
      `keyRangeStart: ${keyRangeStart.rangeStart} (from key ${keyRangeStart.key})`,
    );
    console.log(`keyRangeEnd: ${keyRangeEnd}`);
    console.log(`outputRangeEnd: ${outputRangeEnd}`);
    console.log(`valueRange: ${valueRange.start} ${valueRange.end}`);
    console.log("----");

    rangeLeft.start = outputRangeEnd;
  }

  return output;
}

function getKeyRangeStart(
  inputStart: number,
  map: Map,
): { key: number; rangeStart: number } {
  // Get the largest key smaller than inputStart
  let maxKey = -1;
  for (const key of map.keys) {
    if (key > inputStart) {
      break;
    }
    maxKey = key;
  }

  if (maxKey === -1) {
    return { key: inputStart, rangeStart: inputStart };
  }

  const { range } = map.valueAndRangeByKey[maxKey]!;

  const keyRangeEnd = maxKey + range - 1;

  const mappedKey = inputStart;

  if (inputStart > keyRangeEnd) {
    return { key: inputStart, rangeStart: inputStart };
  }

  return { key: maxKey, rangeStart: inputStart };
}

/**
 * Find the lowest range ending point for the given range start
 */
function getKeyRangeEnd({ key }: { key: number }, map: Map) {
  const valueAndRange = map.valueAndRangeByKey[key];

  if (valueAndRange == null) {
    // Find next range start
    const max = map.keys.find((mapKey) => mapKey > key);
    return max ?? Number.POSITIVE_INFINITY;
  }

  const { range } = valueAndRange;

  return key + range;
}

function getValue(inputKey: number, map: Map) {
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

function getSeedPairs(seedPairs: ReadonlyArray<number>) {
  let seeds = [...seedPairs];
  let output: Array<[number, number]> = [];
  while (seeds.length > 0) {
    const [seed, range] = seeds.slice(0, 2);
    if (seed == null || range == null) {
      throw new Error("Could not read seed input");
    }
    output.push([seed, range]);
    seeds = seeds.slice(2);
  }
  return output;
}

function getSeedRanges(
  seedPairs: ReadonlyArray<[number, number]>,
): ReadonlyArray<Range> {
  const output: Array<Range> = [];
  for (const [start, range] of seedPairs) {
    output.push({
      start,
      end: start + range,
    });
  }
  return output;
}

export default findLowestLocation;
