/**
 * Trim and single-space a string
 */
export function cleanInputString(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
