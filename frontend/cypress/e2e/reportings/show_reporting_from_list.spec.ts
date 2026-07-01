import { stubSideWindowOptions } from '../../support/commands'

context('Show reporting from the reporting list', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')

    // NAMO area — contains the reporting for 'RENCONTRER VEILLER APPARTEMENT', which has both a vessel and a position.
    // `stubSideWindowOptions` makes the side window render in the same document instead of a real popup,
    // so we can drive it and then observe its effect on the main window's map within a single test.
    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(1000)
  })

  it('Should show the reporting on the map and open its vessel sidebar, even though the reportings layer is hidden by filters', () => {
    // Given: the reportings layer is hidden by default (not toggled on) — open the reporting list from the map
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Voir la vue détaillée des signalements')
    cy.wait(1000)

    // The side window renders on top of the main window (via a stubbed same-document portal rather than a
    // real popup), so its actionability checks are unreliable here — force every click inside it.
    cy.getDataCy('side-window-reporting-tab').click({ force: true })
    cy.getDataCy('side-window-sub-menu-NAMO').click({ force: true })

    // When: clicking "Voir sur la carte" for the reporting
    cy.get('tr:contains("RENCONTRER VEILLER APPARTEMENT")')
      .find('*[data-cy="side-window-silenced-alerts-show-vessel"]')
      .click({ force: true })

    // Then: the reporting is force-displayed on the map and selected, despite the reportings layer being hidden
    cy.getFeaturesFromLayer('REPORTING').should(features => {
      const feature = features.find(f => f.get('vesselName') === 'RENCONTRER VEILLER APPARTEMENT')

      assert.exists(feature, 'reporting feature should be force-displayed on the map')
      expect(feature?.get('isSelected'), 'reporting feature should be selected').to.equal(true)
    })

    // And: the vessel sidebar opens on the reporting tab for that vessel
    cy.get('*[data-cy="vessel-sidebar"]').should('exist')
    cy.get('*[data-cy="vessel-reporting"]').should('exist')

    // When: closing the vessel sidebar (still behind the side window overlay, which this test never closes)
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]').click({ force: true })

    // Then: the reporting is hidden again since the reportings layer is still off
    cy.getFeaturesFromLayer('REPORTING').should(features => {
      const feature = features.find(f => f.get('vesselName') === 'RENCONTRER VEILLER APPARTEMENT')

      assert.notExists(feature, 'reporting feature should no longer be force-displayed on the map')
    })
  })
})
