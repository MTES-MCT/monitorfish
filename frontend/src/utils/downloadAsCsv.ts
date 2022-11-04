import { ExportToCsv } from 'export-to-csv'
import { fromPairs, map, pipe, toPairs, unnest } from 'ramda'

type Nsnu = number | string | null | undefined
type NsnuPair = [string, number | string | null | undefined]
type StringAnyPair = [string, any]

const exportToCsv = new ExportToCsv({
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false
})

const prefixRecordKeysWith = (record: Record<string, any>, prefix: string): Record<string, any> =>
  pipe(
    toPairs,
    map<StringAnyPair, StringAnyPair>(([key, value]) => [`${prefix}.${key}`, value]),
    fromPairs
  )(record)

// The record pair is nested in an array and `unnest()`-ed later on in `normalizeRecord()`
// for the sake of simplicity and typing, avoiding the use of a reducer
const normalizeRecordPair = ([key, value]: [string, any]): NsnuPair[] => {
  switch (true) {
    case typeof value === 'number':
    case typeof value === 'string':
    // eslint-disable-next-line no-fallthrough, no-null/no-null
    case value === null:
    case value === undefined:
      return [[key, value]]

    // Check if it's a POJO
    // https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
    case Object.prototype.toString.call(value) === '[object Object]':
      // We first prefix the subkeys with the current key
      // and then recursively normalize the record
      return toPairs(prefixRecordKeysWith(value, key))
        .map(normalizeRecordPair)
        .map(([recordPairs]) => recordPairs as NsnuPair)

    default:
      return [[key, String(value)]]
  }
}

const normalizeRecord: (record: Record<string, any>) => Record<string, Nsnu> = pipe(
  toPairs,
  map(normalizeRecordPair),
  unnest,
  fromPairs
)

export function downloadAsCsv(data: Record<string, any>[]): void {
  if (!data.length) {
    return
  }

  // We return for test mock purposes
  // eslint-disable-next-line consistent-return
  return exportToCsv.generateCsv(data.map(normalizeRecord))
}
