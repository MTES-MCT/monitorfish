import { findElementBytext } from '../utils/findElementBytext'

const RETRIES = 5

export function clickButton(
  label: string,
  {
    index = 0,
    withinSelector
  }: Partial<{
    index: number | undefined
    withinSelector: string | undefined
  }> = {},
  leftRetries: number = RETRIES
): Cypress.Chainable<JQuery<HTMLButtonElement>> {
  const preSelector = withinSelector ? `${withinSelector} ` : ''

  const iconButtonElement = Cypress.$(`${preSelector}button[aria-label="${label}"]`).get(index) as HTMLButtonElement
  const textButtonElement = findElementBytext(`${preSelector}button`, label, { index }) as HTMLButtonElement | null
  const menuItemElement = findElementBytext(`${preSelector}[role="menuitem"]`, label, { index }) as HTMLElement | null

  if (iconButtonElement) {
    return cy.wrap(iconButtonElement).scrollIntoView().click({ force: true }).wait(250)
  }

  if (menuItemElement) {
    return cy
      .wrap(menuItemElement as any)
      .scrollIntoView()
      .click({ force: true })
      .wait(250)
  }

  if (textButtonElement) {
    return cy.wrap(textButtonElement).scrollIntoView().click({ force: true }).wait(250)
  }

  if (leftRetries > 0) {
    return cy.wait(250).then(() => {
      cy.log(`Retrying (${RETRIES - leftRetries + 1} / ${RETRIES})...`)

      return clickButton(label, { index, withinSelector }, leftRetries - 1)
    })
  }

  throw new Error(`Unable to find button with label "${label}".`)
}
