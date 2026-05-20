context('AIS Positions Overlay', () => {
  it('AIS vessel card should be visible when AIS layer is enabled and hidden when disabled', () => {
    cy.login('superuser')
    cy.visit('/#@-607980,6052751,8.70')
    cy.wait(3000)

    cy.clickButton('AIS')
    cy.wait(3000)

    cy.hoverOrClickVesselByName('ETOILE DES ILES', 'AIS_VESSELS_POINTS')

    cy.wait(50)
    cy.get('*[data-cy="vessel-card-name"]').contains('ETOILE DES ILES')
    cy.get('*[data-cy="vessel-card-latitude"]').should('be.visible')
    cy.get('*[data-cy="vessel-card-longitude"]').should('be.visible')

    // When we disable the AIS layer
    cy.clickButton('AIS')
    cy.wait(250)

    cy.hoverOrClickVesselByName('ETOILE DES ILES', 'AIS_VESSELS_POINTS')

    cy.wait(50)
    cy.get('*[data-cy="vessel-card-name"]').should('not.exist')
  })
})
