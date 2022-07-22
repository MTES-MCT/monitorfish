/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Reporting', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${port}/#@-582151.17,6006980.16,10.94`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-58')
  })

  it('Should be showed on map When vessels have infraction suspicions', () => {
    cy.cleanScreenshots(1)

    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("de risque des navires")')
      .click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('not.exist')

    // When
    cy.get('.vessels').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: "percent",
      },
      screenshotConfig: {
        clip: { x: 500, y: 400, width: 200, height: 200 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
