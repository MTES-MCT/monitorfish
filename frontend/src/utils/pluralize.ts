/**
 * pluralize a given low case string
 */
export function pluralize(text: string, count: number): string {
  return text + (count > 1 ? 's' : '')
}
