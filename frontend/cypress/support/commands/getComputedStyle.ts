/**
 * @description
 * Useful to get computed style when elements have inline styles
 */
export function getComputedStyle(
  dataCy: string,
  backUpToParentNumber: number = 0
): Cypress.Chainable<CSSStyleDeclaration> {
  const element = getParentElement(dataCy, backUpToParentNumber)

  return element.then($element => {
    const style = window.getComputedStyle($element.get(0))

    return Promise.resolve(style)
  })
}

function getParentElement(dataCy: string, backUpToParentNumber: number) {
  switch (backUpToParentNumber) {
    case 0:
      return cy.get(dataCy)
    case 1:
      return cy.get(dataCy).parent()
    case 2:
      return cy.get(dataCy).parent().parent()
    default:
      return cy.get(dataCy)
  }
}
