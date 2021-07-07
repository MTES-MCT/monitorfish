/// <reference types="cypress" />

import { getDate } from '../../src/utils'

context('VesselSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://0.0.0.0:${process.env.REACT_APP_CYPRESS_PORT}/#@-824534.42,6082993.21,8.70`)
    cy.wait(2000)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // Then
    cy.get('*[data-cy^="cfr"]').contains("GBR000B14430")
    cy.get('*[data-cy^="vessel-name"]').contains("CABO ORTEGAL (GB)")
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]').click()

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]').contains("Sennes danoises (SDN)")
  })

  it('Fishing Should contain the vessel fishing resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.wait(200)

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]').contains("Trémails et filets maillants combinés (GTN)")
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains("3 messages - 2000 kg pêchés au total")
  })

  it('Fishing trips Should be walkable', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.wait(200)

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
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click()

    // Then
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Départ")
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Al Jazeera Port le 11/10/2019 à 01h40 (UTC)")

  })

  it('Controls Should contain the controls resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click()
    cy.wait(200)

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
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click()
    cy.wait(200)

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-last-control-date"]').first().contains(`le ${date}`)
    cy.get('*[data-cy^="vessel-controls-last-control-unit"]').first().contains("ULAM 56")
    cy.get('*[data-cy^="vessel-controls-last-control-infractions"]').first().contains("2 infractions")
  })

  it('Vessel track depth Should be changed', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click()
    cy.get('*[data-cy^="vessel-track-depth-twelve-hours"]').click()

    // Then
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains("7.5 nds")
  })
})

