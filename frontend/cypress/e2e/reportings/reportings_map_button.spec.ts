context('Reportings Map Button', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.visit('/#@-188008.06,6245230.27,8.70')
    cy.wait('@displayReportings')
    cy.wait(500)
  })

  it('Reporting layer should be opened, hidden and shown', () => {
    // Dialog should not exist initially
    cy.get('*[data-cy="reporting-map-menu-box"]').should('not.exist')

    // Open the dialog
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // Hide the reporting layer
    cy.clickButton('Masquer les signalements')
    cy.get('.REPORTING').should('not.exist')

    // After reload, the layer is still hidden
    cy.reload()
    cy.wait(500)
    cy.get('.REPORTING').should('not.exist')

    // Show the reporting layer back
    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.get('.REPORTING').should('exist')
  })
})
