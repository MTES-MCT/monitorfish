/**
 * Log to console only in DEV
 * @param text
 */
export function logInDev(text) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(text)
  }
}
