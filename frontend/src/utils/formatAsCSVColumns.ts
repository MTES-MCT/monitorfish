import type { CodeAndName } from '../domain/entities/types'

/**
 * Example:
 * {
 *   internalReferenceNumber: {
 *     code: "internalReferenceNumber",   <-- The property contained in `initialObject`
 *     name: "CFR"
 *   }
 * }
 */
export type CsvColumns = Record<string, CodeAndName>

/**
 * Format object's data as specified in the CSV column
 * @param initialObject - The value object
 * @param csvColumns - The columns to be exported in the CSV
 * @param filters - Filters of the exported columns contained in the csvColumns object
 * @returns - a new array
 */
export function formatAsCSVColumns(initialObject, csvColumns: CsvColumns, filters?: string[] | undefined) {
  let csvColumnsAsArray = Object.entries(csvColumns)

  if (filters?.length) {
    csvColumnsAsArray = csvColumnsAsArray.filter(([, column]) => filters.some(filter => column.code === filter))
  }

  return csvColumnsAsArray.reduce((collector, [, column]) => {
    // eslint-disable-next-line no-param-reassign
    collector[column.name] = initialObject[column.code]

    return collector
  }, {})
}
