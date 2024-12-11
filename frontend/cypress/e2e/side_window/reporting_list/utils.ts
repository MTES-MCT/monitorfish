export const openSideWindowReportingList = () => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.getDataCy('side-window-reporting-tab').click()

  cy.wait(500)
}
