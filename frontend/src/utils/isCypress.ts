/**
 * Detects whether the browser app is running in Cypress.
 *
 * @description
 * We use a Cypress session to inject inject a Local Storage key
 * so that we can detect when the browser app is running in Cypress.
 *
 * @see https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-preserve-cookies--localStorage-in-between-my-tests
 */
export function isCypress() {
  return localStorage.getItem('IS_CYPRESS') === 'true'
}
