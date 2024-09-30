import { RTK_MAX_RETRIES } from '@api/constants'

import { editSideWindowPriorNotification } from './utils'

context('Side Window > Logbook Prior Notification Form > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1

  it('Should handle fetching error as expected', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109_COR?isManuallyCreated=false&operationDate=*'

    cy.intercept(
      {
        method: 'GET',
        times: failedQueryCount,
        url
      },
      {
        statusCode: 400
      }
    ).as('getPriorNotificationsWithError')

    editSideWindowPriorNotification(`L'ANCRE`, 'FAKE_OPERATION_109_COR')

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
  })

  it('Should handle sent message list fetching error as expected', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_108/sent_messages'

    cy.intercept(
      {
        method: 'GET',
        times: failedQueryCount,
        url
      },
      {
        statusCode: 400
      }
    ).as('getPriorNotificationSentMessagesWithError')

    editSideWindowPriorNotification(`CALAMARO`, 'FAKE_OPERATION_108')

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationSentMessagesWithError')
    }

    cy.contains(`Impossible de récupérer la liste.`).should('be.visible')
    cy.contains(`Impossible de récupérer l’historique.`).should('be.visible')
  })
})
