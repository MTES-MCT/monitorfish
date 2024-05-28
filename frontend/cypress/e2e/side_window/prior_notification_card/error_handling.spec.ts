import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowPriorNotification } from './utils'

context('Side Window > Prior Notification Card > Error Handling', () => {
  const failedQueriesCount = RTK_MAX_RETRIES + 1
  const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109'

  it('Should handle fetching error as expected', () => {
    cy.intercept(
      {
        method: 'GET',
        times: failedQueriesCount,
        url
      },
      {
        statusCode: 400
      }
    ).as('getPriorNotificationsWithError')

    openSideWindowPriorNotification(`L'ANCRE`)

    for (let i = 1; i <= failedQueriesCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
  })
})
