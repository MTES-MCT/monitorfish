/// <reference types="cypress" />

context('TritonFish', () => {
  it('view Should have some features removed', () => {
    // Given
    cy.loadPath('/ext#@-824534.42,6082993.21,8.70')

    // Then
    // Vessel sidebar is minimized
    cy.get('.VESSELS').click(460, 480, { force: true, timeout: 10000 })
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="global-risk-factor"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-alert"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-beacon-malfunction"]').should('not.exist')

    // Vessel sidebar menus
    cy.get('*[data-cy="vessel-menu-identity"]').should('be.visible')
    cy.get('*[data-cy="vessel-menu-fishing"]').should('be.visible')
    cy.get('*[data-cy="vessel-menu-controls"]').should('be.visible')
    cy.get('*[data-cy="vessel-menu-resume"]').should('not.exist')
    cy.get('*[data-cy="vessel-menu-reporting"]').should('not.exist')
    cy.get('*[data-cy="vessel-menu-ers-vms"]').should('not.exist')

    // Vessel list
    cy.get('*[data-cy="vessel-list"]').should('exist')

    // filters
    cy.get('*[data-cy="vessel-filters"]').should('exist')

    // No alerts
    cy.get('*[data-cy="alerts-button"]').should('not.exist')

    // No risk factors
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })
    // For the throttle of labels
    cy.get('body').type('{upArrow}')
    cy.get('*[data-cy="vessel-label-text"]').should('have.length.to.be.greaterThan', 5)
    cy.get('*[data-cy="vessel-label-risk-factor"]').should('not.exist')

    // No beacon malfunctions
    cy.get('*[data-cy="beacon-malfunction-button"]').should('not.exist')

    // Given
    cy.loadPath('/ext#@-188008.06,6245230.27,8.70')

    // Then
    // No missions
    cy.get('*[data-cy="mission-label-text"]').should('not.exist')
  })
})
