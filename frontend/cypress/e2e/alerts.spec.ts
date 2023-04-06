/// <reference types="cypress" />

context('Alerts', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
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
    cy.get('.VESSELS_POINTS').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { height: 200, width: 200, x: 400, y: 400 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
