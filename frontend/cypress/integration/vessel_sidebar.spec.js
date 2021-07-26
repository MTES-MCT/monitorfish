/// <reference types="cypress" />

import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('VesselSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-name"]').contains("PHENOMENE (GB)", { timeout: 20000 })
    cy.get('*[data-cy^="vessel-cfr"]').contains("FAK000999999")
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-menu-identity"]').click()

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-identity-gears"]').contains("Sennes danoises (SDN)")
  })

  it('Fishing Should contain the vessel fishing resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-gears"]').contains("Trémails et filets maillants combinés (GTN)")
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains("1 message - 2256 kg pêchés au total")
  })

  it('Fishing trips Should be walkable', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463715")

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click()
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463714")

    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click()
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains("Marée n°9463715")
  })

  it('Fishing Should contain the vessel DEP message', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click()

    // Then
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Départ")
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Al Jazeera Port le 11/10/2019 à 01h40 (UTC)")
  })

  it('Controls Should contain the controls resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click()
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-controls-year"]').first().contains("2 contrôles, 2 infractions")

    // When
    cy.get('*[data-cy^="vessel-controls-year"]').first().click()

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-title"]').first().contains(`CONTRÔLE DU ${date}`)
  })

  it('Last SEA and LAND controls Should be presents', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click()
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 20000 }).should('be.visible')

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-last-control-date"]').first().contains(`le ${date}`)
    cy.get('*[data-cy^="vessel-controls-last-control-unit"]').first().contains("ULAM 56")
    cy.get('*[data-cy^="vessel-controls-last-control-infractions"]').first().contains("Pas d'infraction")
  })

  it('Vessel track depth Should be changed', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click()
    cy.get('*[data-cy^="vessel-track-depth-twelve-hours"]').click()

    // Then
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains("14 nds")
  })
})
