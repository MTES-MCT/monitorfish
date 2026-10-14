import { SeafrontGroup } from '@constants/seafront'

import { stubSideWindowOptions } from '../../support/commands'
import { deleteReporting } from '../main_window/vessel_sidebar/utils'

// The gear-target reporting has no vessel, so the reporting table must resolve its "Cible" column from
// the gear referential instead of a vessel name (and must not render the vessel's country flag).
context('Reporting gear target', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')

    // Map centered on the NAMO/MEMN boundary; the reporting point lands in the MEMN seafront
    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(3000)
  })

  it('Should create a reporting targeting a gear (DCP) and display its gear in the reporting table', () => {
    let createdReportingId: number | undefined

    // Given a new INN reporting targeting a DCP gear
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Créer un nouveau signalement INN')

    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')
    cy.get('*[data-cy="map-reporting-form"]').contains('NOUVEAU SIGNALEMENT INN')

    cy.get('input[name="reportingSource"][value="OTHER"]').click()
    cy.fill('Autres types de source', 'DIRM')
    cy.fill('Identité de l’émetteur', 'Jean Bon (0612365896)')

    cy.clickButton('Ajouter un point')
    cy.wait(250)
    cy.get('body').trigger('click', { clientX: 200, clientY: 200, force: true, pointerId: 1 })
    cy.get('body').click(150, 150)
    cy.wait(250)
    cy.clickButton('Valider le point de signalement')

    // Target the DCP gear instead of a vessel
    cy.fill('Type de cible', 'Engin')
    cy.fill("Type d'engin", 'FAD')

    cy.fill('Titre', 'Test INN - Cible DCP')
    cy.fill('Type d’infraction et NATINF 1', ['27717'])

    cy.wait('@createReporting').then(({ response }) => {
      createdReportingId = response?.body.id
    })
    cy.wait('@displayReportings')
    cy.get('*[data-cy="map-reporting-form"]').contains('Dernière modif.')

    cy.clickButton('Fermer')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

    // When the reporting list is opened and searched for the new reporting
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Voir la vue détaillée des signalements')
    cy.wait(1000)
    cy.getDataCy('reporting-table-filters').should('exist')
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.MEMN}`).click({ force: true })

    cy.fill('Rechercher dans les signalements', 'Test INN - Cible DCP')
    // The search is debounced
    cy.wait(1000)

    // Then the reporting is displayed with its gear target instead of a vessel name
    cy.getDataCy('ReportingTable-reporting').contains('Test INN - Cible DCP').should('exist')
    cy.getDataCy('ReportingTable-reporting').contains('Dispositif de concentration de poissons (DCP)').should('exist')

    // Clean up so the test can be run repeatedly
    cy.then(() => {
      if (createdReportingId !== undefined) {
        deleteReporting(createdReportingId)
      }
    })
  })
})
