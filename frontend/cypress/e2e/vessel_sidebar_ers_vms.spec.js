/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel sidebar ers/vms tab', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('ERS/VMS tab Should contain history of beacon malfunctions and show a malfunction detail in history', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselBeaconMalfunctions')

    // When
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-beacon-malfunctions"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="vessel-malfunctions-resume"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.wait('@vesselBeaconMalfunctions')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 20000 }).contains('à quai 1')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-last"]', { timeout: 20000 }).contains('Activité détectée')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 20000 }).children().eq(0).contains('1 avarie en mer')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 20000 }).children().eq(0).contains('0 avarie à quai')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 20000 }).children().eq(0).click()
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 20000 }).children().eq(1).contains('Aucune avarie')

    // See the details of a beacon malfunction
    cy.get('*[data-cy="vessel-beacon-malfunction-history-see-more"]', { timeout: 20000 }).click()
    cy.get('*[data-cy="vessel-malfunctions-details"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 20000 }).contains('0 commentaire')
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 20000 }).contains('Avarie en mer ouverte dans MonitorFish, dernière émission à')
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 20000 }).contains('Le ticket a été déplacé de Premier contact à Fin de l\'avarie.')
    cy.get('*[data-cy="beacon-malfunction-details"]', { timeout: 20000 }).contains('Navire en mer')
    cy.get('*[data-cy="beacon-malfunction-details"]', { timeout: 20000 }).contains('14 jours')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()
  })

  it('ERS/VMS tab Should contain current and history of beacon malfunctions', () => {
    // Go to the detail of a beacon malfunction and go back to resume
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 20000 }).children().eq(0).click()
    cy.get('*[data-cy="vessel-beacon-malfunction-history-see-more"]', { timeout: 20000 }).click({ force: true })
    cy.get('*[data-cy="beacon-malfunction-back-to-resume"]', { timeout: 20000 }).click()
    cy.get('*[data-cy="vessel-malfunctions-resume"]', { timeout: 20000 }).should('be.visible')

    // See current beacon malfunction
    cy.get('*[data-cy="beacon-malfunction-current-see-details"]', { timeout: 20000 }).click()
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 20000 }).contains('Activité détectée')

    // Search for another vessel
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselTwoBeaconMalfunctions')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('U_W0')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(1).click()

    // Then
    cy.wait('@vesselTwoBeaconMalfunctions')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
    cy.get('*[data-cy="vessel-malfunctions-resume"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="vessel-beacon-malfunctions"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 20000 }).contains('à quai 0')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 20000 }).contains('en mer 1')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-last"]', { timeout: 20000 }).contains('Sans nouvelles')

    // See current beacon malfunction of new vessel
    cy.get('*[data-cy="beacon-malfunction-current-see-details"]', { timeout: 20000 }).click()
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 20000 }).contains('Sans nouvelles')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()
  })
})
