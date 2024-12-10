context('Missions Map Button', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-47979.79,6309598.10,8.70')
    cy.wait(500)
  })

  it('Mission layer Should be showed and hidden', () => {
    // Given
    cy.get('.MISSION_PIN_POINT').should('exist')
    cy.get('*[data-cy^="missions-menu-box"]').should('not.be.visible')
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 1)

    // When
    cy.get('*[data-cy^="missions-map-button"]').forceClick()
    cy.get('*[data-cy^="missions-menu-box"]').should('be.visible')
    cy.get('*[data-cy^="toggle-mission-layer"]').forceClick()

    // Then
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 0)
    cy.get('.MISSION_PIN_POINT').should('not.exist')

    // On reload, the missions are still hidden
    cy.reload()
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 0)
    cy.get('.MISSION_PIN_POINT').should('not.exist')

    // Show the missions back
    cy.get('*[data-cy^="missions-map-button"]').forceClick()
    cy.get('*[data-cy^="missions-menu-box"]').should('be.visible')
    cy.get('*[data-cy^="toggle-mission-layer"]').forceClick()
    cy.get('.MISSION_PIN_POINT').should('exist')
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 1)
  })
})
