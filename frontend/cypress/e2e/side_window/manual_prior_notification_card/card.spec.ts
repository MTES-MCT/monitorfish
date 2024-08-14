import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

import { openSideWindowPriorNotificationCardAsUser } from '../logbook_prior_notification_card/utils'

context('Side Window > Manual Prior Notification Card > Card', () => {
  it('Should display a read-only manual prior notification form', () => {
    openSideWindowPriorNotificationCardAsUser(`POISSON PAS NET`, '00000000-0000-4000-0000-000000000001')

    // Title
    cy.contains(`Préavis navire < 12 M`).should('be.visible')
    cy.contains(`POISSON PAS NET (CFR112)`).should('be.visible')

    // Message Header
    cy.contains(`Préavis (notification de retour au port) – navire sans JPE`).should('be.visible')

    // Message Body
    cy.contains(`Filets soulevés portatifs (LNP)`).should('be.visible')
  })

  it('Should refresh the list when the opened manual prior notification data differs from its entry in the current list', () => {
    const url =
      '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000001?isManuallyCreated=true&operationDate=*'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotificationCardAsUser(`POISSON PAS NET`, '00000000-0000-4000-0000-000000000001')

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.Detail = interception.response!.body
      const updatedPriorNotificationDetailStub: PriorNotification.Detail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109'
      }

      cy.reload()

      cy.fill('Rechercher un navire', `POISSON`)

      cy.intercept('GET', url, { body: updatedPriorNotificationDetailStub }).as('getUpdatedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.getTableRowById('00000000-0000-4000-0000-000000000001').clickButton('Consulter le préavis')

      cy.wait('@getUpdatedPriorNotification')
      cy.wait('@getPriorNotifications')

      cy.contains(`POISSON PAS NET (CFR112)`).should('be.visible')
    })
  })
})
