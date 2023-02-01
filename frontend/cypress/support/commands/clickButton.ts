import { findElementBytext } from '../utils/findElementBytext'

export function clickButton(
  label: string,
  {
    index = 0,
    withinSelector
  }: Partial<{
    index: number
    withinSelector: string
  }> = {}
): Cypress.Chainable<JQuery<HTMLButtonElement>> {
  cy.wait(500)

  const preSelector = withinSelector ? `${withinSelector} ` : ''

  const iconButtonElement = Cypress.$(`${preSelector}button[aria-label="${label}"]`).get(index) as HTMLButtonElement
  const textButtonElement = findElementBytext(`${preSelector}button`, label, { index }) as HTMLButtonElement | null

  if (iconButtonElement) {
    return cy.wrap(iconButtonElement).scrollIntoView().click()
  }

  if (textButtonElement) {
    return cy.wrap(textButtonElement).scrollIntoView().click()
  }

  throw new Error(`Unable to find button with label "${label}".`)
}
