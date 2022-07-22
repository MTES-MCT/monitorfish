/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel sidebar resume tab', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    cy.get('.vessels').click(460, 480, { timeout: 10000, force: true })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-name"]').contains('PHENOMENE (GB)', { timeout: 10000 })
    cy.get('*[data-cy^="global-risk-factor"]').contains('2.5', { timeout: 10000 })
    cy.get('*[data-cy^="impact-risk-factor"]').contains('2.1', { timeout: 10000 })
    cy.get('*[data-cy^="probability-risk-factor"]').contains('2.0', { timeout: 10000 })
    cy.get('*[data-cy^="detectability-risk-factor"]').contains('3.0', { timeout: 10000 })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar-alert"]').contains('3 milles - Chaluts', { timeout: 10000 })
    cy.get('*[data-cy^="vessel-sidebar-beacon-malfunction"]').contains('NON-ÉMISSION VMS', { timeout: 10000 })

    cy.get('*[data-cy^="impact-risk-factor"]').click({ timeout: 10000, force: true })
    cy.get('*[data-cy^="probability-risk-factor"]').click({ timeout: 10000, force: true })
    cy.get('*[data-cy^="detectability-risk-factor"]').click({ timeout: 10000, force: true })
    cy.get('*[data-cy^="risk-factor-priority-level"]').contains('2.6 – élevée', { timeout: 10000 })

    cy.get('*[data-cy^="show-risk-factor-explanation-modal"]').click({ timeout: 10000, force: true })
  })
})
