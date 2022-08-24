/**
 * @param {string} text
 * @returns string
 */
export function cleanInputString(text) {
  return text.replace(/\s+/g, ' ').trim()
}
