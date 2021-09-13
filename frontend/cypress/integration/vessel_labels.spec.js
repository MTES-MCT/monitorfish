/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel labels', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Risk factors Should be showed on the map', () => {
    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 20)
    // And the ship "FRAIS AVIS MODE" contains a risk factor of 2.6
    cy.get('*[data-cy^="vessel-label-risk-factor"]').first().contains(2.6)
  })

  it('Vessels names Should be showed on the map', () => {
    // When
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="vessel-label-text"]').first().contains('FRAIS AVIS MODE')
  })

  it('Vessels names Should be movable', () => {
    // When
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-label-draggable"]').first().click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="vessel-label-draggable"]').first()
      .trigger('pointerdown', { force: true, which: 1, eventConstructor: 'MouseEvent', animationDistanceThreshold: 100, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 400, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 600, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })
  })
})
