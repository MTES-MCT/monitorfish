import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

import { openSideWindowPriorNotificationCardAsUser } from './utils'

context('Side Window > Logbook Prior Notification Card > Card', () => {
  it('Should display a logbook prior notification corrected message as expected', () => {
    openSideWindowPriorNotificationCardAsUser(`L'ANCRE`, 'FAKE_OPERATION_109_COR')

    // Title
    cy.contains(`Préavis navire < 12 M`).should('be.visible')
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

  it('Should display a logbook prior notification successfully acknowledged message as expected', () => {
    openSideWindowPriorNotificationCardAsUser(`BARS`, 'FAKE_OPERATION_107')

    // Title
    cy.contains(`Préavis navire ≥ 12 M`).should('be.visible')
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

  it('Should refresh the list when the opened logbook prior notification data differs from its entry in the current list', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109_COR?isManuallyCreated=false&operationDate=*'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotificationCardAsUser(`L'ANCRE`, 'FAKE_OPERATION_109_COR')

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.Detail = interception.response!.body
      const updatedPriorNotificationDetailStub: PriorNotification.Detail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109'
      }

      cy.reload()

      cy.fill('Rechercher un navire', `L'ANCRE`)

      cy.intercept('GET', url, { body: updatedPriorNotificationDetailStub }).as('getUpdatedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.getTableRowById('FAKE_OPERATION_109_COR').clickButton('Consulter le préavis')

      cy.wait('@getUpdatedPriorNotification')
      cy.wait('@getPriorNotifications')

      cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
    })
  })

  it('Should display a warning banner and refresh the list when the opened logbook prior notification has been deleted', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109_COR?isManuallyCreated=false&operationDate=*'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotificationCardAsUser(`L'ANCRE`, 'FAKE_OPERATION_109_COR')

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.Detail = interception.response!.body
      const deletedPriorNotificationDetailStub: PriorNotification.Detail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109',
        logbookMessage: {
          ...originalPriorNotificationDetail.logbookMessage,
          isDeleted: true
        }
      }

      cy.reload()

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
