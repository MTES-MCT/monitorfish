Cypress.Commands.add('loadPath', (path: string): void => {
  cy.visit(path)

  cy.url().should('include', path)

  cy.wait(5000)
})
