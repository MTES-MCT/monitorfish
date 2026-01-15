/* eslint-disable no-undef */

import { addAndCreateReportingWithinVesselSidebar } from './utils'

import type { Reporting } from '@features/Reporting/types'
import {getUtcDateInMultipleFormats} from "../../utils/getUtcDateInMultipleFormats";

context('Vessel sidebar reporting tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('An infraction suspicion reporting Should be added from the reporting form', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')
    cy.wait(100)

    addAndCreateReportingWithinVesselSidebar()
    cy.wait('@getVesselReportings')

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.get('*[data-cy="reporting-card"]')
      .eq(0)
      .contains("Ce navire ne devrait pas être en mer, il n'a plus de points sur son permis")
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Émetteur: Jean Bon (0612365896)')
    cy.getDataCy('reporting-card').contains('Transbordement / NATINF 27717').should('be.visible')
    cy.get('*[data-cy="reporting-card"]').first().contains('Pas de fin de validité')

    // The reporting should be found in the reporting tab of the side window
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)
    cy.get('*[data-cy="ReportingTable-reporting"]').first().contains('FRAIS AVIS MODE')

    // Archive the newly created reporting
    cy.get('table .rs-checkbox-control').eq(1).click({ force: true })
    cy.clickButton('Archiver 1 signalement')
    cy.clickButton('Archiver')
  })

  it('An observation reporting should be modified to an Infraction suspicion', () => {
    const date = getUtcDateInMultipleFormats('2166-06-08T13:54')
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('ABC000597493')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')
    cy.wait(100)

    // Create a new Observation
    cy.clickButton('Ouvrir un signalement')
    cy.fill('Type de signalement', 'Observation')
    cy.fill('Origine', 'Unité')
    cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
    cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
    cy.fill('Titre', 'Observation: Sortie non autorisée')
    cy.fill('Description', 'Ce navire ne devrait pas être en mer, mais ceci est une observation.')
    cy.fill('Fin de validité', date.utcDateTuple)

    cy.clickButton('Valider')

    cy.wait('@createReporting').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification: Reporting.Reporting = createInterception.response.body

      cy.intercept('PUT', `/bff/v1/reportings/${createdPriorNotification.id}`).as('updateReporting')
      cy.get('*[data-cy="reporting-card"]').first().contains('Fin de validité le 08/06/2166')

      cy.get('*[data-cy^="edit-reporting-card"]').first().scrollIntoView().click({ timeout: 10000 })
      cy.fill('Type de signalement', 'Infraction (suspicion)')
      cy.fill('Type d’infraction et NATINF', ['27717'])
      const nextDate = getUtcDateInMultipleFormats('2200-06-08T13:54')
      cy.fill('Fin de validité', nextDate.utcDateTuple)
      cy.clickButton('Valider')
      cy.wait('@updateReporting')
      cy.wait(50)

      cy.getDataCy('reporting-card').contains('Transbordement / NATINF 27717').should('be.visible')
      cy.get('*[data-cy="reporting-card"]').first().contains('Fin de validité le 08/06/2200')
      cy.get('*[data-cy="delete-reporting-card"]').eq(0).scrollIntoView().click()
      // Then, we confirm the reporting deletion
      cy.clickButton('Supprimer')
    })
  })

  it('Reporting Should be archived', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')
    cy.wait(100)

    addAndCreateReportingWithinVesselSidebar()

    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.getDataCy('reporting-card').eq(0).contains('Transbordement / NATINF 27717').should('be.visible')
    cy.get('*[data-cy="archive-reporting-card"]').eq(0).click()
    // Then, we confirm the reporting deletion
    cy.clickButton('Archiver')

    // Then
    cy.get('*[data-cy="reporting-card"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-archived-reporting"]').should('exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-archive-year"]').eq(0).click()
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  it('Reporting summary of reportings should be displayed', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('mariage ile hasard')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept('GET', '/bff/v1/vessels/reportings*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')

    addAndCreateReportingWithinVesselSidebar()
    cy.wait('@getVesselReportings')
    cy.wait(200)
    cy.get('[data-cy="archive-reporting-card"]').eq(0).click()
    // Then, we confirm the reporting deletion
    cy.clickButton('Archiver')
    cy.get('*[data-cy="vessel-sidebar-archived-reporting"]').should('exist')

    // Then
    // Summary
    cy.get('[data-cy="vessel-reporting-summary"]').contains('Dernières suspicions d’infractions (12 derniers mois)')
    cy.get('[data-cy="vessel-reporting-summary"]').contains('Famille inconnue')
    cy.get('[data-cy="vessel-reporting-summary"]').contains(
      "Type inconnu / NATINF 7059"
    )
    cy.get('[data-cy="vessel-reporting-summary"]').contains('Mesures techniques et de conservation')
    cy.get('[data-cy="vessel-reporting-summary"]').contains(
      "Transbordement / NATINF 27717"
    )

    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  it('Reporting Should be showed for more years', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.intercept('GET', '/bff/v1/vessels/reportings*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')
    cy.wait(100)

    // When
    cy.get('*[data-cy="vessel-sidebar-archived-reporting"]').should('exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-archive-year"]').should('have.length', 4)
    cy.clickButton('Afficher plus de signalements')

    // Then
    cy.wait('@getVesselReportings')
    cy.get('*[data-cy="vessel-sidebar-reporting-archive-year"]').should('have.length', 5)
  })

  it('Reporting Should be deleted', () => {
    cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@getVesselReportings')
    cy.wait(100)

    addAndCreateReportingWithinVesselSidebar()

    // When
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).scrollIntoView().click()
    // First, we do not confirm the reporting deletion
    cy.clickButton('Annuler', { withinSelector: '.Component-Dialog' })
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).scrollIntoView().click()
    // Then, we confirm the reporting deletion
    cy.clickButton('Supprimer')

    // Then
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })
})
