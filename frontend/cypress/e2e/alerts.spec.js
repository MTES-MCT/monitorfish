/// <reference types="cypress" />

context('Alerts', () => {
  beforeEach(() => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Should be showed on map When vessels have alerts', () => {
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
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { x: 400, y: 400, width: 200, height: 200 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
