import { openSideWindowPriorNotification } from './utils'
import { openSideWindowPriorNotificationList } from '../prior_notification_list/utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

context('Side Window > Prior Notification Card > Card', () => {
  it('Should display a corrected message as expected', () => {
    openSideWindowPriorNotification(`L'ANCRE`)

    // Title
    cy.contains(`PNO < 12 M - SEGMENT(S) INCONNU(S)`).should('be.visible')
    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')
    cy.contains(`MESSAGE CORRIGÉ`).should('be.visible')

    // Message Body
    cy.contains(`Vannes (FRVNE)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`BATHYBATES FEROX (BHX)`).should('be.visible')
    cy.contains(`32.5 kg`).should('be.visible')
  })

  it('Should display a non-editable message for a non-super user', () => {
    cy.intercept('/bff/v1/authorization/current', { statusCode: 401 }).as('getIsSuperUser')
    openSideWindowPriorNotification(`POISSON PAS NET`)
    cy.wait('@getIsSuperUser')

    // Title
    cy.contains(`PNO < 12 M - SEGMENT(S) INCONNU(S)`).should('be.visible')
    cy.contains(`POISSON PAS NET (CFR112)`).should('be.visible')

    // Message Header
    cy.contains(`Préavis (notification de retour au port) – navire sans JPE`).should('be.visible')

    // Message Body
    cy.contains(`Filets soulevés portatifs (LNP)`).should('be.visible')
  })

  it('Should display a successfully acknowledged message as expected', () => {
    openSideWindowPriorNotification(`BARS`)

    // Title
    cy.contains(`PNO ≥ 12 M - NWW03 (CHALUT DE FOND EN EAU PROFONDE ≥100 MM)`).should('be.visible')
    cy.contains(`DES BARS (CFR104)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')

    // Message Body
    cy.getDataCy('LogbookMessage-successful-acknowledgement-icon').should('be.visible')
    cy.contains(`Saint-Malo (FRSML)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`MORUE COMMUNE (CABILLAUD) (COD)`).should('be.visible')
    cy.contains(`25 kg`).should('be.visible')
  })

  it('Should display a failed acknowledged message as expected', () => {
    openSideWindowPriorNotification(`CALAMARO`)

    // Title
    cy.contains(`PNO ≥ 12 M - SEGMENT(S) INCONNU(S)`).should('be.visible')
    cy.contains(`CALAMARO (CFR105)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')

    // Message Body
    cy.getDataCy('LogbookMessage-failed-acknowledgement-icon').should('be.visible')
    cy.contains(`Saint-Malo (FRSML)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`BAUDROIE (ANF)`).should('be.visible')
    cy.contains(`150 kg`).should('be.visible')
  })

  it('Should refresh the list when the opened prior notification data differs from its entry in the current list', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotification(`L'ANCRE`)

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.PriorNotificationDetail = interception.response!.body
      const updatedPriorNotificationDetailStub: PriorNotification.PriorNotificationDetail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109'
      }

      openSideWindowPriorNotificationList()
      cy.fill('Rechercher un navire', `L'ANCRE`)

      cy.intercept('GET', url, { body: updatedPriorNotificationDetailStub }).as('getUpdatedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.clickButton('Consulter le préavis')

      cy.wait('@getUpdatedPriorNotification')
      cy.wait('@getPriorNotifications')

      cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
    })
  })

  it('Should display a warning banner and refresh the list when the opened prior notification has been deleted', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotification(`L'ANCRE`)

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.PriorNotificationDetail = interception.response!.body
      const deletedPriorNotificationDetailStub: PriorNotification.PriorNotificationDetail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109',
        logbookMessage: {
          ...originalPriorNotificationDetail.logbookMessage,
          isDeleted: true
        }
      }

      openSideWindowPriorNotificationList()
      cy.fill('Rechercher un navire', `L'ANCRE`)

      cy.intercept('GET', url, { body: deletedPriorNotificationDetailStub }).as('getDeletedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.clickButton('Consulter le préavis')

      cy.wait('@getDeletedPriorNotification')
      cy.wait('@getPriorNotifications')

      // The warning banner should be displayed
      cy.contains(`Ce préavis a été supprimé (entre temps).`).should('be.visible')
      // The card should be closed
      cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('not.exist')
    })
  })
})
