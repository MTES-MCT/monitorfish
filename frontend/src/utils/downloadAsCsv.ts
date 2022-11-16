// TODO Import `export-to-csv` dependency code (since it's short) to handle null and undefined with empty CSV values.
// https://www.npmjs.com/package/export-to-csv is not maintained anymore.

import { ExportToCsv } from 'export-to-csv'
import { fromPairs, isEmpty, map, pipe, toPairs, unnest } from 'ramda'

import type { CollectionItem } from '../types'

type CsvType = boolean | number | string | null | undefined
type CsvTypePair = [string, CsvType]
type CsvTypeRecord = Record<string, CsvType>
type StringAnyPair = [string, any]

export type DownloadAsCsvMap<T extends CollectionItem> = Record<
  string,
  | string
  | {
      label: string
      transform?: (item: T) => CsvType
    }
>

const flattenAndNormalizeRecord = <T extends CollectionItem>(record: T, csvMap: DownloadAsCsvMap<T>): CsvTypeRecord =>
  pipe(
    toPairs,
    map(flattenRecordPair),
    unnest,
    fromPairs as (flattenRecordPairs: any) => CollectionItem,
    (flattenRecord: CollectionItem): CsvTypeRecord => normalizeRecord<T>(flattenRecord, record, csvMap)
  )(record)

// The record pair is nested in an array and `unnest()`-ed later on in `normalizeRecord()`
// for the sake of simplicity and typing, avoiding the use of a reducer
const flattenRecordPair = ([key, value]: StringAnyPair): StringAnyPair[] => {
  // If it's a POJO
  if (typeof value === 'object' && value?.constructor?.name === 'Object') {
    return toPairs(prefixRecordKeysWith(value, key))
      .map(flattenRecordPair)
      .map(([recordPairs]) => recordPairs as CsvTypePair)
  }

  return [[key, value]]
}

const isCsvMapPairWithTransform = <T extends CollectionItem>(
  maybeCsvMapEntry:
    | string
    | {
        label: string
        transform?: ((item: T) => CsvType) | undefined
      }
): maybeCsvMapEntry is {
  label: string
  transform: (item: T) => CsvType
} => typeof maybeCsvMapEntry !== 'string' && Boolean(maybeCsvMapEntry.transform)

const normalizeRecord = <T extends CollectionItem>(
  flattenRecord: CollectionItem,
  rawRecord: T,
  csvMap: DownloadAsCsvMap<T>
): CsvTypeRecord => {
  const csvMapPairs = toPairs(csvMap)
  const normalizedRecordPairs = csvMapPairs.map(([mapKey, mapEntry]): CsvTypePair => {
    const normalizedKey = typeof mapEntry === 'string' ? mapEntry : mapEntry.label
    const value = flattenRecord[mapKey]

    if (isCsvMapPairWithTransform<T>(mapEntry)) {
      return [normalizedKey, mapEntry.transform(rawRecord)]
    }

    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return [normalizedKey, value]
    }

    // eslint-disable-next-line no-null/no-null
    if (value === null || value === undefined) {
      return [normalizedKey, '']
    }

    return [normalizedKey, String(value)]
  })

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
