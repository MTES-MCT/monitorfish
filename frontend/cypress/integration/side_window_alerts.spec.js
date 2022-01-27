/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Alerts', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/side_window`)
  })

  it('Seven alerts Should be shown When clicking on the NAMO menu', () => {
    // When
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()

    // Then
    cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains('7')
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 7)

    cy.get('*[data-cy^="side-window-alerts-list"]').children().last().contains('ABC000363962')
    cy.get('*[data-cy^="side-window-alerts-list"]').children().last().contains('3 milles - Chaluts')

    // Show vessel on map
    cy.intercept('GET', 'bff/v1/vessels/find?internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
      '&IRCS=CALLME&vesselIdentifier=UNDEFINED&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime=').as('showVesselPositionsOnMap')
    cy.intercept('GET', 'bff/v1/ers/find?internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
      '&IRCS=CALLME&voyageRequest=LAST&tripNumber=').as('showVesselVoyageOnMap')
    cy.get('*[data-cy="side-window-alerts-show-vessel"]').first().click()
    cy.wait('@showVesselPositionsOnMap')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
    cy.wait('@showVesselVoyageOnMap')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
  })

  it('Alerts Should be filtered based on the search input', () => {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-SA"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 2)

    // When
    cy.get('*[data-cy^="side-window-alerts-search-vessel"]').type('ABC0003')

    // Then
    cy.get('*[data-cy^="side-window-alerts-list"]').children().should('have.length', 2)
  })
})
