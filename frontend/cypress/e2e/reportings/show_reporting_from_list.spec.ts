import { SeafrontGroup } from '@constants/seafront'

import { stubSideWindowOptions } from '../../support/commands'

// `stubSideWindowOptions` makes the side window render in the same document instead of a real popup, so a
// single test can drive it and then observe its effect on the main window's map.
// The side window then sits on top of the main window, so its own actionability checks are unreliable —
// every click inside it is forced.
function openSideWindowReportingList() {
  cy.clickButton('Signalements')
  cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
  cy.clickButton('Voir la vue détaillée des signalements')
  cy.wait(1000)

  cy.getDataCy('side-window-reporting-tab').click({ force: true })
  cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click({ force: true })
}

context('Show reporting from the reporting list', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')

    // NAMO area — contains the reporting for 'RENCONTRER VEILLER APPARTEMENT', which has both a vessel and a position
    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(1000)
  })

  it('Should show the reporting on the map and open its vessel sidebar, even though the reportings layer is hidden by filters', () => {
    openSideWindowReportingList()

    cy.clickButton('Voir sur la carte', { withinSelector: 'tr:contains("RENCONTRER VEILLER APPARTEMENT")' })

    // Matching only by vessel name isn't enough to pick out a specific feature when this vessel has more
    // than one reporting, so check that at least one of its features is the selected one
    cy.getFeaturesFromLayer('REPORTING').should(features => {
      const matchingFeatures = features.filter(f => f.get('vesselName') === 'RENCONTRER VEILLER APPARTEMENT')

      assert.isNotEmpty(matchingFeatures, 'reporting feature should be force-displayed on the map')
      expect(
        matchingFeatures.some(f => f.get('isSelected') === true),
        'one of its reporting features should be selected'
      ).to.equal(true)
    })

    cy.get('*[data-cy="vessel-sidebar"]').should('exist')
    cy.get('*[data-cy="vessel-reporting"]').should('exist')

    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]').click({ force: true })

    cy.getFeaturesFromLayer('REPORTING').should(features => {
      const feature = features.find(f => f.get('vesselName') === 'RENCONTRER VEILLER APPARTEMENT')

      assert.notExists(feature, 'reporting feature should no longer be force-displayed on the map')
    })
  })

  it('Should keep the reporting shown when switching vessel sidebar tabs', () => {
    openSideWindowReportingList()

    cy.clickButton('Voir sur la carte', { withinSelector: 'tr:contains("RENCONTRER VEILLER APPARTEMENT")' })
    cy.get('*[data-cy="vessel-reporting"]').should('exist')

    cy.get('*[data-cy="vessel-menu-summary"]').click({ force: true })
    cy.get('*[data-cy="vessel-summary-latitude"]').should('exist')
    cy.get('*[data-cy="vessel-reporting"]').should('not.exist')

    cy.getFeaturesFromLayer('REPORTING').should(features => {
      const matchingFeatures = features.filter(f => f.get('vesselName') === 'RENCONTRER VEILLER APPARTEMENT')

      expect(
        matchingFeatures.some(f => f.get('isSelected') === true),
        'the reporting should still be selected after switching tabs'
      ).to.equal(true)
    })
  })

  it('Should open the reporting form and show it on the map for a reporting without a vessel', () => {
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')
    cy.wait(2000)

    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Créer un nouveau signalement INN')

    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')
    cy.get('input[name="reportingSource"][value="OTHER"]').click()
    cy.fill('Autres types de source', 'DIRM')
    cy.fill('Identité de l’émetteur', 'Jean Bon (0612365896)')
    cy.clickButton('Ajouter un point')
    cy.wait(250)
    cy.get('body').trigger('click', { clientX: 200, clientY: 200, force: true, pointerId: 1 })
    cy.get('body').click(150, 150)
    cy.wait(250)
    cy.clickButton('Valider le point de signalement')
    cy.fill('Nombre de navires', 2)
    cy.fill('Nationalité', 'France')
    cy.fill('Engin', 'PTM')
    cy.fill('Titre', 'Signalement sans navire cypress')
    cy.fill('Type d’infraction et NATINF 1', ['27717'])

    cy.wait('@createReporting').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdReportingId: number = createInterception.response.body.id

      cy.clickButton('Fermer')
      cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

      openSideWindowReportingList()
      cy.clickButton('Voir sur la carte', { withinSelector: 'tr:contains("Signalement sans navire cypress")' })

      cy.get('*[data-cy="map-reporting-form"]').should('be.visible')
      cy.get('*[data-cy="map-reporting-form"]').contains('Signalement sans navire cypress')

      cy.getFeaturesFromLayer('REPORTING').should(features => {
        const feature = features.find(f => f.get('id') === createdReportingId)

        assert.exists(feature, 'reporting feature should be force-displayed on the map')
        expect(feature?.get('isSelected'), 'reporting feature should be selected').to.equal(true)
      })

      cy.clickButton('Fermer')
      cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

      cy.getFeaturesFromLayer('REPORTING').should(features => {
        const feature = features.find(f => f.get('id') === createdReportingId)

        assert.notExists(feature, 'reporting feature should no longer be force-displayed on the map')
      })

      cy.request({ method: 'DELETE', url: `/bff/v1/reportings/${createdReportingId}` })
    })
  })
})
