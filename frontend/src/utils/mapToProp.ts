export function mapToProp<T extends Record<string, any>, K extends keyof T>(records: T[], key: K): Array<T[K]> {
  return records.map(record => record[key])
}
