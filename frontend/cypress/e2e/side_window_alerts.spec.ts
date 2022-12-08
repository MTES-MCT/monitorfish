/// <reference types="cypress" />

context('Alerts', () => {
  beforeEach(() => {
    cy.visit('/side_window')
  })

  it('Going to beacon malfunction then back in alerts Should not throw an exception', () => {
    // Given
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()

    // When
    cy.get('[data-cy="side-window-menu-beacon-malfunctions"]').click()

    // Then
    cy.get('[data-cy="side-window-menu-alerts"]').click()
    cy.get('[data-cy="side-window-sub-menu-MEMN"]').should(
      'have.css',
      'background',
      'rgb(204, 207, 214) none repeat scroll 0% 0%'
    )
  })

  it('Nine alerts Should be shown When clicking on the NAMO menu', () => {
    // When
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()

    // Then
    cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains('9')
    cy.get('*[data-cy^="side-window-alerts-number-silenced-vessels"]').contains(
      'Suspension d’alerte sur 2 navires en NAMO'
    )
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 9)

    cy.get(':nth-child(9)').contains('3 milles - Chaluts')
    cy.get(':nth-child(9)').contains('LE b@TO')
    cy.get(':nth-child(9)').contains('7059')

    // Show vessel on map
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
        '&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime='
    ).as('showVesselPositionsOnMap')
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&voyageRequest=LAST&tripNumber='
    ).as('showVesselVoyageOnMap')
    cy.get('*[data-cy="side-window-alerts-show-vessel"]').first().forceClick()
    cy.wait('@showVesselPositionsOnMap').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.wait('@showVesselVoyageOnMap').then(({ response }) => expect(response && response.statusCode).equal(200))

    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().contains('3 milles - Chaluts')
  })

  it('Alerts Should be filtered based on the search input', () => {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-SA"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 3)

    // When
    cy.get('*[data-cy^="side-window-alerts-search-vessel"]').type('ABC0003')

    // Then
    cy.get('*[data-cy^="side-window-alerts-list"]').children().should('have.length', 2)
  })

  it('An alert Should be validated', () => {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().should('have.length', 2)

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/1/validate').as('validateAlert')
    cy.get('*[data-cy="side-window-alerts-validate-alert"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-alerts-is-validated-transition"]').should('be.visible')
    cy.wait('@validateAlert').then(({ response }) => expect(response && response.statusCode).equal(200))

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 8)
    // As the alert is validated, it will be silenced for 4 hours but not shown in the silenced alerts table
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().should('have.length', 2)
  })

  it('An alert Should be silenced', () => {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().should('have.length', 2)

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/2/silence').as('silenceAlert')
    cy.get('*[data-cy="side-window-alerts-silence-alert"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-silence-alert-one-hour"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-alerts-is-silenced-transition"]').should('be.visible')
    cy.wait('@silenceAlert').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().should('have.length', 3)

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.wait(200)
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 7)
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]').children().eq(1).children().should('have.length', 3)
  })
})
