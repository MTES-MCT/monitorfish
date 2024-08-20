import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowPriorNotificationListAsSuperUser } from './utils'

context('Side Window > Prior Notification List > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should handle fetching error as expected', () => {
    cy.intercept(
      {
        method: 'GET',
        times: failedQueryCount,
        url: `${apiPathBase}*`
      },
      {
        statusCode: 400
      }
    ).as('getPriorNotificationsWithError')

    openSideWindowPriorNotificationListAsSuperUser()

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })
})
