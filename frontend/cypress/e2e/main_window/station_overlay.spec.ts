context('Main Window > Station Overlay', () => {
  beforeEach(() => {
    cy.visit(`/#@-282045.85,6101658.31,9.11`).wait(5000)

    cy.clickButton('Liste des unités de contrôle')
    cy.clickButton('Afficher les bases').wait(1000)
  })

  it('Should show the expected station card when selected', () => {
    // Click on Vannes base
    cy.get('.ol-viewport').click(550, 650, { force: true })

    cy.getDataCy('StationOverlay-card').contains('Vannes').should('be.visible')
    cy.getDataCy('StationOverlay-card').contains('Cultures marines 56').should('be.visible')
    cy.getDataCy('StationOverlay-card').find('.Element-Tag').eq(0).should('have.text', '1 Vedette')
    cy.getDataCy('StationOverlay-card').find('.Element-Tag').eq(1).should('have.text', '1 Voiture')
  })
})
