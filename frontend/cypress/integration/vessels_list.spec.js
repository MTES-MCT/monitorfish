/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessels list', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,7.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Vessels Should be filtered and previewed on the map', () => {
    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 20000 })

    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[class^="rs-picker-tag-wrapper"]').eq(0).type('France{enter}')
    cy.get('*[data-cy^="vessels-list-box-filter"]').click({ timeout: 20000 })
    cy.get('body').click(30, 200, { timeout: 20000 })
    cy.get('body').click(700, 650, { timeout: 20000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('11 navires')

    // When
    cy.get('*[data-cy^="preview-filtered-vessels"]').click({ timeout: 20000 })
    cy.wait(500)
    cy.get('.vessels').dblclick(0, 0, { force: true })
    cy.wait(2000)

    // Then
    cy.get('.vessels').trigger('pointerdown', { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 646, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 648, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 649, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels').trigger('pointerup', { clientX: 411, clientY: 645, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(500)

    cy.get('*[data-cy^="vessel-label-text"]').should('have.length', 3)
    cy.get('.vessels').click(63, 456, { force: true })
    cy.get('*[data-cy^="vessel-summary-latitude"]', { timeout: 20000 }).contains('-')

    // Back to vessels list
    cy.get('*[data-cy^="back-to-vessels-list"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('11 navires')
  })

  it('Vessels Should be filtered based on their location at port', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('959 navires')

    // When
    cy.get('*[data-cy^="filter-vessel-at-port"]').click()
    cy.wait(1000)

    // Then
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('803 navires')

    // Then re-show the vessels at port
    cy.get('*[data-cy^="filter-vessel-at-port"]').click()
    cy.wait(1000)

    cy.get('*[data-cy^="vessel-list-table-count"]').contains('959 navires')
  })
})
