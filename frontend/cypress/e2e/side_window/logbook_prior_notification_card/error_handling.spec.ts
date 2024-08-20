import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowPriorNotificationCardAsUser } from './utils'

context('Side Window > Logbook Prior Notification Card > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109_COR?isManuallyCreated=false&operationDate=*'

  it('Should handle fetching error as expected', () => {
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

    openSideWindowPriorNotificationCardAsUser(`L'ANCRE`, 'FAKE_OPERATION_109_COR')

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
  })
})
