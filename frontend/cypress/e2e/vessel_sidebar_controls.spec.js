/* eslint-disable no-undef */
/// <reference types="cypress" />

import { getDate } from '../../src/utils'

context('Vessel sidebar controls tab', () => {
  beforeEach(() => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('Controls Should contain the controls resume', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 10000, force: true })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 10000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-controls-year"]').first().contains('1 contrôle, 2 infractions', { timeout: 10000 })

    // When
    cy.get('*[data-cy^="vessel-controls-year"]').first().click({ timeout: 10000 })

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-title"]').first().contains(`CONTRÔLE DU ${date}`, { timeout: 10000 })
  })

  it('Last SEA and LAND controls Should be presents', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 10000, force: true })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-controls"]', { timeout: 10000 }).should('be.visible')

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy^="vessel-controls-last-control-date"]').first().contains(`le ${date}`, { timeout: 10000 })
    cy.get('*[data-cy^="vessel-controls-last-control-unit"]').first().contains('ULAM 56', { timeout: 10000 })
    cy.get('*[data-cy^="vessel-controls-last-control-infractions"]').first().contains('2 infractions', { timeout: 10000 })
  })
})
