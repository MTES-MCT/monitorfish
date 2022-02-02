/* eslint-disable no-undef */
/// <reference types="cypress" />

import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('VesselSearch', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(1000)
  })

  it('Vessel from last positions and vessels table Should be searched from the search bar', () => {
    // When searching a vessel from the last positions table
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

    // Search a vessel in the vessel table
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('MALOTRU')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).contains('MALOTRU')
  })

  it('Vessel history Should be shown When having previously searched vessels', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()

    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('détacher')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()

    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).click()

    // Then
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).should('have.length', 2)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).contains('DÉTACHER ROULER ÉCHAPPER')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(1).contains('PHENOMENE')

    // Reload page
    cy.reload()
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')

    // Vessels should be kept in list
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).should('have.length', 2)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(0).contains('DÉTACHER ROULER ÉCHAPPER')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(1).contains('PHENOMENE')
  })
})
