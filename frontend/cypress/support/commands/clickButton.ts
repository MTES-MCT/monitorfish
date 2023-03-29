import { findElementBytext } from '../utils/findElementBytext'

const RETRIES = 5

export function clickButton(
  prevSubjectElements: HTMLElement[] | undefined,
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
  const prevSubjectElement = prevSubjectElements ? prevSubjectElements[0] : undefined
  if (prevSubjectElements && !prevSubjectElements[0]) {
    throw new Error('`prevSubjectElements[0]` is undefined.')
  }

  const preSelector = withinSelector ? `${withinSelector} ` : ''

  const iconButtonElementByAriaLabel = prevSubjectElement
    ? (Cypress.$(prevSubjectElement).find(`${preSelector}button[aria-label="${label}"]`).get(index) as
        | HTMLButtonElement
        | undefined)
    : (Cypress.$(`${preSelector}button[aria-label="${label}"]`).get(index) as HTMLButtonElement | undefined)
  const iconButtonElementByTitle = prevSubjectElement
    ? (Cypress.$(prevSubjectElement).find(`${preSelector}button[aria-label="${label}"]`).get(index) as
        | HTMLButtonElement
        | undefined)
    : (Cypress.$(`${preSelector}button[title="${label}"]`).get(index) as HTMLButtonElement | undefined)
  const textButtonElement = findElementBytext(`${preSelector}button`, label, {
    index,
    inElement: prevSubjectElement
  }) as HTMLButtonElement | null
  const menuItemElement = findElementBytext(`${preSelector}[role="menuitem"]`, label, {
    index,
    inElement: prevSubjectElement
  }) as HTMLElement | null

  if (iconButtonElementByAriaLabel) {
    return cy.wrap(iconButtonElementByAriaLabel).scrollIntoView().click({ force: true }).wait(250)
  }

  if (iconButtonElementByTitle) {
    return cy.wrap(iconButtonElementByTitle).scrollIntoView().click({ force: true }).wait(250)
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

      return clickButton(undefined, label, { index, withinSelector }, leftRetries - 1)
    })
  }

  throw new Error(`Unable to find button with label "${label}".`)
}
