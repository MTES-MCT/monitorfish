import { RTK_MAX_RETRIES } from '@api/constants'

import { editSideWindowPriorNotification } from './utils'

context('Side Window > Manual Prior Notification Form > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const url = '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000002?isManuallyCreated=true&operationDate=*'

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

    editSideWindowPriorNotification(`DOS FIN`, '00000000-0000-4000-0000-000000000002')

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`DOS FIN (CFR115)`).should('be.visible')
  })
})
