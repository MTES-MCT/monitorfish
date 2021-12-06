/// <reference types="cypress" />

import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('VesselSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(400)
  })

  it('Vessel Should be searched from the search bar', () => {
    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // We should be able to search again when the vessel sidebar is already opened
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('détacher')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).click()

    // Close the sidebar
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 20000 }).should('not.exist')
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-name"]').contains("PHENOMENE (GB)", { timeout: 20000 })
    cy.get('*[data-cy^="global-risk-factor"]').contains("2.5", { timeout: 20000 })
    cy.get('*[data-cy^="impact-risk-factor"]').contains("2.1", { timeout: 20000 })
    cy.get('*[data-cy^="probability-risk-factor"]').contains("2.0", { timeout: 20000 })
    cy.get('*[data-cy^="detectability-risk-factor"]').contains("3.0", { timeout: 20000 })
    cy.get('*[data-cy^="vessel-sidebar-alert"]').contains("CHALUTAGE DANS LES 3 MILLES", { timeout: 20000 })

    cy.get('*[data-cy^="impact-risk-factor"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="probability-risk-factor"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="detectability-risk-factor"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="risk-factor-priority-level"]').contains("2.6 – élevée", { timeout: 20000 })

    cy.get('*[data-cy^="show-risk-factor-explanation-modal"]').click({ timeout: 20000, force: true })
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-menu-identity"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-identity-gears"]').contains("Sennes danoises (SDN)", { timeout: 20000 })
  })

  it('Fishing Should contain the vessel fishing resume', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-gears"]').contains("Trémails et filets maillants combinés (GTN)", { timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains("1 message - 2256 kg pêchés au total", { timeout: 20000 })
  })

  it('Fishing trips Should be walkable', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463715", { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463714", { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains("1 message - aucune capture", { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463715", { timeout: 20000 })
  })

  it('Fishing Should contain the vessel DEP message', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Départ", { timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Al Jazeera Port le 11/10/2019 à 01h40 (UTC)", { timeout: 20000 })
  })

  it('Controls Should contain the controls resume', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-controls-year"]').first().contains("3 contrôles, 2 infractions", { timeout: 20000 })

    // When
    cy.get('*[data-cy^="vessel-controls-year"]').first().click({ timeout: 20000 })

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-title"]').first().contains(`CONTRÔLE DU ${date}`, { timeout: 20000 })
  })

  it('Last SEA and LAND controls Should be presents', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 20000 }).should('be.visible')

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-last-control-date"]').first().contains(`le ${date}`, { timeout: 20000 })
    cy.get('*[data-cy^="vessel-controls-last-control-unit"]').first().contains("ULAM 56", { timeout: 20000 })
    cy.get('*[data-cy^="vessel-controls-last-control-infractions"]').first().contains("2 infractions", { timeout: 20000 })
  })

  it('Vessel track depth Should be changed', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })

    // Then
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains("0 nds", { timeout: 20000 })

    // And click on a position to zoom in
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="1"] > .rs-table-cell-content').trigger('pointermove',  { pointerId: 1, force: true })
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="1"] > .rs-table-cell-content').click({ force: true })

    // The table should be sorted in ascending datetime order
    cy.get('.rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content').click({ timeout: 20000 })
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains("8.7 nds", { timeout: 20000 })
  })

  it('Vessel track dates Should be changed When walking in fishing trips', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })

    // Then
    cy.get('.rs-picker-toggle-value').contains('16-02-2019')
    cy.get('.rs-picker-toggle-value').contains('15-10-2019')
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').should('not.have.class', 'rs-radio-checked')

    // Then, back to another trip depth of three days
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Fishing activities Should be seen on the vessel track and showed from the map', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })

    // Then
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 3)
    cy.get('*[data-cy^="fishing-activity-name"]').eq(2).click({ timeout: 20000 })
    cy.get('#OOF20191030059909').should('be.visible')
    cy.get('#OOF20190627059908').should('not.be.visible')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Fishing activities Should be changed according to the actual trip When walking in fishing trips', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })

    // When
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 3)
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('previousTripPositions')
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })

    // Then
    cy.wait('@previousTripPositions').its('response.url')
      .should('eq', 'http://localhost:8880/bff/v1/vessels/positions?internalReferenceNumber=FAK000999999' +
        '&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=CUSTOM' +
        '&afterDateTime=2019-02-16T21:05:00.000Z&beforeDateTime=2019-10-15T13:01:00.000Z')

    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy="custom-dates-showed-text"]').contains('Piste affichée du 16/02/19 au 15/10/19')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('previousTripPositions')
    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 20000 })
    cy.wait('@previousTripPositions').its('response.url')
      .should('eq', 'http://localhost:8880/bff/v1/vessels/positions?internalReferenceNumber=FAK000999999' +
        '&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=CUSTOM' +
        '&afterDateTime=2019-10-10T22:06:00.000Z&beforeDateTime=2019-10-22T12:06:00.000Z')
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
    cy.get('*[data-cy="custom-dates-showed-text"]').contains('Piste affichée du 10/10/19 au 22/10/19')

    // Go back to the default track depth
    cy.get('*[data-cy="custom-dates-show-last-positions"]').click()
    cy.get('*[data-cy="custom-dates-showed-text"]').should('not.exist')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-twelve-hours"]').should('have.class', 'rs-radio-checked')
  })

  it('Single fishing activity Should be seen on map When clicking on the position icon', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 20000 })
    cy.scrollTo(0, 380)
    cy.get('*[data-cy^="show-fishing-activity"]').eq(6).click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 1)

    // Then hide the fishing activity
    cy.get('*[data-cy^="hide-fishing-activity"]').eq(0).click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Vessel track Should fit the view box When I click on animate to track', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="animate-to-track"]').click({ timeout: 20000 })

    // Then, the last position should be positioned in the bottom of the window
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 910, clientY: 300, pointerId: 1, force: true })
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 315, clientY: 835, pointerId: 1, force: true })
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 315, clientY: 835, pointerId: 1, force: true })
    cy.wait(200)

    cy.get('*[data-cy^="vessel-track-card-latitude"]', { timeout: 20000 }).contains('47° 20′ 53″ N')
  })
})
