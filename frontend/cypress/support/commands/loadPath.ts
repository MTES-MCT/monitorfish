Cypress.Commands.add('loadPath', (path: string): void => {
  cy.visit(path)
  cy.url().should('include', path)
  // TODO Find a stable way to check for finished rendering
  // cy.wait(10000)
})
