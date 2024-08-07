import { RTK_MAX_RETRIES } from '@api/constants'

import { editSideWindowPriorNotification } from './utils'

context('Side Window > Prior Notification Form > Error Handling', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109?isManuallyCreated=false&operationDate=*'

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

    editSideWindowPriorNotification(`L'ANCRE`, 'FAKE_OPERATION_109')

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getPriorNotificationsWithError')
    }

    cy.intercept('GET', url).as('getPriorNotification')

    cy.clickButton('Réessayer')

    cy.wait('@getPriorNotification')

    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
  })
})
