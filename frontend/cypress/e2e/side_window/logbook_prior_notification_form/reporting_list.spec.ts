import { createReportingFromPriorNotificationForm, editSideWindowPriorNotification } from './utils'
import { deleteReporting } from '../../main_window/vessel_sidebar/utils'

import type { Reporting } from '@features/Reporting/types'

context('Side Window > Logbook Prior Notification Form  > Reporting List', () => {
  it('Should create a reporting', () => {
    cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

    // Given
    editSideWindowPriorNotification('LE POISSON AMBULANT', 'FAKE_OPERATION_112_COR_ORPHAN')

    cy.clickButton('Ouvrir un signalement sur le navire')
    cy.wait('@getVesselReportings')

    // When
    cy.fill('Origine', 'Unité')
    cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
    cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
    cy.fill('Titre', 'Sortie non autorisée')
    cy.fill('Description', 'Ce navire ne devrait pas être en mer.')
    cy.fill('Natinf', '2608')
    cy.fill('Saisi par', 'LTH', { index: 1 })

    cy.clickButton('Valider')

    cy.wait('@createReporting').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification: Reporting.Reporting = createInterception.response.body

      // Then
      cy.getDataCy('reporting-card').should('have.length', 1)
      cy.getDataCy('reporting-card').eq(0).contains('OFB SD 56 / Sortie non autorisée')
      cy.getDataCy('reporting-card').eq(0).contains('Ce navire ne devrait pas être en mer.')
      cy.getDataCy('reporting-card').eq(0).contains('Émetteur: Jean Bon (0612365896)')
      cy.getDataCy('reporting-card').eq(0).contains('NATINF 2608')

      // Reset
      deleteReporting(createdPriorNotification.id)
    })
  })

  it('Should edit a reporting', () => {
    // Given
    createReportingFromPriorNotificationForm('LE POISSON AMBULANT', 'FAKE_OPERATION_112_COR_ORPHAN').then(
      createdReportingId => {
        cy.intercept('PUT', `/bff/v1/reportings/${createdReportingId}/update`).as('updateReporting')

        cy.getDataCy('reporting-card').should('have.length', 1)

        // When
        cy.clickButton('Éditer ce signalement')

        cy.fill('Origine', 'Unité')
        cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
        cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
        cy.fill('Titre', 'Sortie non autorisée')
        cy.fill('Description', 'Ce navire ne devrait pas être en mer.')
        cy.fill('Natinf', '2608')
        cy.fill('Saisi par', 'LTH', { index: 1 })

        cy.clickButton('Valider')

        cy.wait('@updateReporting')

        // Then
        cy.getDataCy('reporting-card').should('have.length', 1)
        cy.getDataCy('reporting-card').eq(0).contains('OFB SD 56 / Sortie non autorisée')
        cy.getDataCy('reporting-card').eq(0).contains('Ce navire ne devrait pas être en mer.')
        cy.getDataCy('reporting-card').eq(0).contains('Émetteur: Jean Bon (0612365896)')
        cy.getDataCy('reporting-card').eq(0).contains('NATINF 2608')

        // Reset
        deleteReporting(createdReportingId)
      }
    )
  })

  it('Should archive a reporting', () => {
    // Given
    createReportingFromPriorNotificationForm('LE POISSON AMBULANT', 'FAKE_OPERATION_112_COR_ORPHAN').then(
      createdReportingId => {
        cy.intercept('PUT', `/bff/v1/reportings/${createdReportingId}/archive`).as('archiveReporting')

        cy.getDataCy('reporting-card').should('have.length', 1)

        // When
        cy.clickButton('Archiver ce signalement')

        cy.wait('@archiveReporting')

        // Then
        cy.getDataCy('reporting-card').should('have.length', 0)

        // Reset
        deleteReporting(createdReportingId)
      }
    )
  })

  it('Should delete a reporting', () => {
    // Given
    createReportingFromPriorNotificationForm('LE POISSON AMBULANT', 'FAKE_OPERATION_112_COR_ORPHAN').then(
      createdReportingId => {
        cy.intercept('PUT', `/bff/v1/reportings/${createdReportingId}/delete`).as('deleteReporting')

        cy.getDataCy('reporting-card').should('have.length', 1)

        // When
        cy.clickButton('Supprimer ce signalement')

        // Then
        cy.contains('Voulez-vous supprimer le signalement ?').should('be.visible')

        // When
        cy.clickButton('Oui')

        cy.wait('@deleteReporting')

        // Then
        cy.getDataCy('reporting-card').should('have.length', 0)
      }
    )
  })
})
