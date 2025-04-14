context('Reporting', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-582151.17,6006980.16,10.94')
    cy.wait(1000)
  })

  it('Should be showed on map When vessels have infraction suspicions', () => {
    cy.cleanScreenshots(1)

    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
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
        clip: { height: 200, width: 200, x: 500, y: 400 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
