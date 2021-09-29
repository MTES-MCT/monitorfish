/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel filters', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('A Filter Should created and added on the map', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[class^="rs-picker-tag-wrapper"]').eq(0).type('France{enter}')
    cy.get('*[class^="rs-picker-tag-wrapper"]').eq(1).type('NWW01/02{enter}')
    cy.get('*[class^="rs-picker-tag-wrapper"]').eq(3).type('HKE{enter}')

    // When
    cy.get('*[data-cy^="save-filter-modal"]').click({ timeout: 20000 })
    cy.get('*[class^="rs-input"]').last().type('Navires FR')
    cy.get('*[data-cy="save-filter"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="vessel-filters"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-filter"]').first().contains('Navires FR', { timeout: 20000 })
    cy.get('*[data-cy="vessel-filter"]').first().click({ timeout: 20000 })

    cy.get('*[data-cy="vessel-filter-tag"]').eq(0).contains('France', { timeout: 20000 })
    cy.get('*[data-cy="vessel-filter-tag"]').eq(1).contains('HKE', { timeout: 20000 })
    cy.get('*[data-cy="vessel-filter-tag"]').eq(2).contains('NWW01/02', { timeout: 20000 })

    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 20)
    cy.get('*[data-cy="vessel-filters-hide-other-vessels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 4)

    // Remove tags
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(2).click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(1).click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(0).click({ timeout: 20000 })

    // We should have ~ the same number of labels than in init
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length.to.be.greaterThan', 5)
  })
})
