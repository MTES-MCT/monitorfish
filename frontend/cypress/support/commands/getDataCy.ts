export function getDataCy(dataCy: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy="${dataCy}"]`)
}
