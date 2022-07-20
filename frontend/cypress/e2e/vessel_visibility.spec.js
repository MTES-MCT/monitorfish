/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel visibility', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${port}/#@-487249.11,6076055.47,15.77`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-48')
  })

  it('Vessels at port Should be hidden and showed', () => {
    // Given
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    // When
    cy.get('*[data-cy="open-vessels-visibility"]').click()
    cy.get('*[data-cy="map-property-trigger"]')
      .filter(':contains("les navires au port")')
      .click({ timeout: 10000, force: true })
    cy.wait(500)
    cy.get('#root').dblclick(560, 620, { timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 12)
  })

})
