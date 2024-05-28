import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowPriorNotificationList } from './utils'

context('Side Window > Prior Notification List > Error Handling', () => {
  const failedQueriesCount = RTK_MAX_RETRIES + 1
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should handle fetching error as expected', () => {
    cy.intercept(
      {
        method: 'GET',
        times: failedQueriesCount,
        url: `${apiPathBase}*`
      },
      {
        statusCode: 400
      }
    ).as('getPriorNotificationsWithError')

    openSideWindowPriorNotificationList()

    for (let i = 1; i <= failedQueriesCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })
})
