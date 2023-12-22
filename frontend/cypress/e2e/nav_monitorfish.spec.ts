context('Light MonitorFish', () => {
  it('Should have some features removed When not logged as super user', () => {
    // Given
    cy.intercept('/bff/v1/authorization/current', { statusCode: 401 }).as('getIsSuperUser')
    cy.visit('/light#@-824534.42,6082993.21,8.70')
    cy.wait('@getIsSuperUser')

    // Then
    // Vessel sidebar is minimized
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="global-risk-factor"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-alert"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-beacon-malfunction"]').should('not.exist')

    // Vessel sidebar menus
    cy.get('*[data-cy="vessel-menu-identity"]').should('be.visible')
    cy.get('*[data-cy="vessel-menu-fishing"]').should('be.visible')
    cy.get('*[data-cy="vessel-menu-controls"]').should('be.visible')

    // Should not include the modify mission button
    cy.get('*[data-cy="vessel-menu-controls"]').click()
    cy.get('*[data-cy="vessel-controls"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="vessel-controls-year"]')
      .filter((_, e) => Cypress.$(e).css('cursor').includes('pointer'))
      .first()
      .click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-control"]').should('not.contain', 'Ouvrir le contrôle')

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

    // Missions
    cy.get('*[data-cy="missions-menu-box"]').should('not.exist')

    // Given
    cy.loadPath('/ext#@-188008.06,6245230.27,8.70')

    // Then
    // No missions
    cy.get('*[data-cy="mission-label-text"]').should('not.exist')
  })
})
