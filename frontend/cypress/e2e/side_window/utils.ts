export const openSideWindowAsUser = () => {
  cy.viewport(1920, 1080)
  cy.login('user')
  cy.visit('/side_window')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.wait(500)
}

export const openSideWindowAsSuperUser = () => {
  cy.viewport(1920, 1080)
  cy.login('superuser')
  cy.visit('/side_window')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.wait(500)
}
