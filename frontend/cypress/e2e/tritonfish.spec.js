/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('TritonFish', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${port}/ext#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('view Should have some features removed', () => {
    // Then
    // Vessel sidebar is minimized
    cy.get('.vessels').click(460, 480, { timeout: 10000, force: true })
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
  })
})
