/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Alerts', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Should be showed on map When vessels have alerts', () => {
    cy.cleanScreenshots()

    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]', { timeout: 20000 })
      .filter(':contains("de risque des navires")')
      .click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('not.exist')

    // When
    cy.get('.vessels').toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 400, y: 400, width: 200, height: 200 }
      }
    })

    cy.cleanScreenshots()
  })
})
