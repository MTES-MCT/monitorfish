/* eslint-disable no-undef */

context('Authorization', () => {
  beforeEach(() => {
    cy.login('superuser')

    cy.intercept('GET', '/bff/v1/fleet_segments/*').as('getFleetSegments')
    cy.intercept('GET', '/bff/v1/reportings').as('getReportings')
    cy.intercept('GET', '/bff/v1/beacon_malfunctions').as('getBeaconMalfunctions')

    cy.visit('/#@-824534.42,6082993.21,8.70')

    cy.wait('@getReportings', { timeout: 15000 })
    cy.wait('@getFleetSegments', { timeout: 15000 })
    cy.wait('@getBeaconMalfunctions', { timeout: 15000 })
    cy.wait(500)
  })

  it('Should redirect to login page if an API request is Unauthorized', () => {
    cy.on("uncaught:exception", () => {
      // We do no track uncaught exception as it is OK that fetch are being canceled
      return false
    })

    // When
    cy.intercept('GET', `/bff/v1/vessels/search*`, { statusCode: 401 }).as('searchVessel')
    cy.intercept('GET', '/bff/v1/authorization/current', { statusCode: 401 })
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.wait('@searchVessel')

    // Then
    cy.location('pathname').should('eq', '/log_in')
  })
})
