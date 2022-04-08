/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Beacon malfunction', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-689844.87,6014092.52,10.57`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-68')
  })

  it('Vessels with beacon malfunction Should be showed on map with a yellow circle', () => {
    cy.cleanScreenshots(1)

    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]', { timeout: 20000 })
      .filter(':contains("de risque des navires")')
      .click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('not.exist')

    // When
    cy.get('.vessels').eq(0).toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 475, y: 570, width: 200, height: 200 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
