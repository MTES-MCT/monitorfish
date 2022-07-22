/* eslint-disable no-undef */
/// <reference types="cypress" />

context('Vessel sidebar identity tab', () => {
  beforeEach(() => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 10000, force: true })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-menu-identity"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-identity-gears"]').contains('Sennes danoises (SDN)', { timeout: 10000 })
  })
})
