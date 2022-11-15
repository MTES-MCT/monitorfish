import { ExportToCsv } from 'export-to-csv'
import { fromPairs, isEmpty, map, pipe, toPairs, unnest } from 'ramda'

import type { CollectionItem } from '../types'

type Nsnu = number | string | null | undefined
type NsnuPair = [string, Nsnu]
type NsnuRecord = Record<string, Nsnu>
type StringAnyPair = [string, any]

export type DownloadAsCsvMap<T extends CollectionItem> = Record<
  string,
  | string
  | {
      label: string
      transform?: (item: T) => Nsnu
    }
>

const flattenAndNormalizeRecord = <T extends CollectionItem>(record: T, csvMap: DownloadAsCsvMap<T>): NsnuRecord =>
  pipe(
    toPairs,
    map(flattenRecordPair),
    unnest,
    fromPairs as (flattenRecordPairs: any) => CollectionItem,
    (flattenRecord: CollectionItem): NsnuRecord => normalizeRecord<T>(flattenRecord, record, csvMap)
  )(record)

// The record pair is nested in an array and `unnest()`-ed later on in `normalizeRecord()`
// for the sake of simplicity and typing, avoiding the use of a reducer
const flattenRecordPair = ([key, value]: StringAnyPair): StringAnyPair[] => {
  // If it's a POJO
  if (typeof value === 'object' && value?.constructor?.name === 'Object') {
    return toPairs(prefixRecordKeysWith(value, key))
      .map(flattenRecordPair)
      .map(([recordPairs]) => recordPairs as NsnuPair)
  }

  return [[key, value]]
}

const isCsvMapPairWithTransform = <T extends CollectionItem>(
  maybeCsvMapEntry:
    | string
    | {
        label: string
        transform?: ((item: T) => Nsnu) | undefined
      }
): maybeCsvMapEntry is {
  label: string
  transform: (item: T) => Nsnu
} => typeof maybeCsvMapEntry !== 'string' && Boolean(maybeCsvMapEntry.transform)

const normalizeRecord = <T extends CollectionItem>(
  flattenRecord: CollectionItem,
  rawRecord: T,
  csvMap: DownloadAsCsvMap<T>
): NsnuRecord => {
  const flattenRecordPairs = toPairs(flattenRecord)
  const normalizedRecordPairs = flattenRecordPairs.reduce<StringAnyPair[]>((flattenRecordPairsStack, [key, value]) => {
    const maybeCsvMapEntry = csvMap[key]
    if (!maybeCsvMapEntry) {
      return flattenRecordPairsStack
    }

    const normalizedKey = typeof maybeCsvMapEntry === 'string' ? maybeCsvMapEntry : maybeCsvMapEntry.label

    if (isCsvMapPairWithTransform<T>(maybeCsvMapEntry)) {
      return [...flattenRecordPairsStack, [normalizedKey, maybeCsvMapEntry.transform(rawRecord)]]
    }

    // eslint-disable-next-line no-null/no-null
    if (typeof value === 'number' || typeof value === 'string' || value === null || value === undefined) {
      return [...flattenRecordPairsStack, [normalizedKey, value]]
    }

    return [...flattenRecordPairsStack, [normalizedKey, String(value)]]
  }, [])

  return fromPairs(normalizedRecordPairs)
}

const prefixRecordKeysWith = (record: Record<string, any>, prefix: string): Record<string, any> =>
  pipe(
    toPairs,
    map<StringAnyPair, StringAnyPair>(([key, value]) => [`${prefix}.${key}`, value]),
    fromPairs
  )(record)

export function downloadAsCsv<T extends CollectionItem>(
  fileName: string,
  data: T[],
  csvMap: DownloadAsCsvMap<T>
): void {
  if (!data.length || isEmpty(csvMap)) {
    return
  }

  const exportToCsv = new ExportToCsv({
    decimalSeparator: '.',
    fieldSeparator: ',',
    filename: fileName,
    quoteStrings: '"',
    showLabels: true,
    showTitle: false,
    useBom: true,
    useKeysAsHeaders: true,
    useTextFile: false
  })

  // We return for test mock purposes
  // eslint-disable-next-line consistent-return
  return exportToCsv.generateCsv(data.map(item => flattenAndNormalizeRecord(item, csvMap)))
}
