/**
 * Detects whether the browser app is driven by a browser automation tool, i.e. our Puppeteer specs.
 *
 * @description
 * Browsers launched by Puppeteer (Chrome as well as Firefox) expose `navigator.webdriver` as `true`,
 * which is not the case of a Cypress session, running in a regular browser.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver
 */
export function isPuppeteer() {
  return navigator.webdriver === true
}
