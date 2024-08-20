import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowPriorNotificationCardAsUser } from '../logbook_prior_notification_card/utils'

context('Side Window > Manual Prior Notification Card > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const url = '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000001?isManuallyCreated=true&operationDate=*'

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

    openSideWindowPriorNotificationCardAsUser(`POISSON PAS NET`, '00000000-0000-4000-0000-000000000001')

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`POISSON PAS NET (CFR112)`).should('be.visible')
  })
})
