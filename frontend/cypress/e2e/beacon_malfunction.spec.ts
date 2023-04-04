/// <reference types="cypress" />

context('Beacon malfunction', () => {
  beforeEach(() => {
    cy.loadPath('/#@-689844.87,6014092.52,10.57')
  })

  it('Vessels with beacon malfunction Should be showed on map with a yellow circle', () => {
    cy.cleanScreenshots(1)

    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("de risque des navires")')
      .click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('not.exist')

    // When
    cy.get('.VESSELS')
      .eq(0)
      .toMatchImageSnapshot({
        imageConfig: {
          threshold: 0.05,
          thresholdType: 'percent'
        },
        screenshotConfig: {
          clip: { height: 200, width: 200, x: 475, y: 570 }
        }
      })

    cy.cleanScreenshots(1)
  })
})
