import { getPseudoRandomString } from '@mtes-mct/monitor-ui'

import { openSideWindowPriorNotificationList } from './utils'

import type { BackendApi } from '@api/BackendApi.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

context('Side Window > Prior Notification List > Pagination', () => {
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should filter prior notifications by seafront group', () => {
    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    openSideWindowPriorNotificationList()

    cy.wait('@getPriorNotifications').then(interception => {
      const responseBody: BackendApi.ResponseBodyPaginatedList<
        PriorNotification.PriorNotification,
        LogbookMessage.ApiListExtraData
      > = interception.response!.body

      const fakeData = [
        ...responseBody.data,
        ...responseBody.data.map(priorNotification => ({ ...priorNotification, id: getPseudoRandomString() }))
      ]

      cy.intercept('GET', `${apiPathBase}*pageNumber=0&pageSize=10*`, {
        body: {
          ...responseBody,
          data: fakeData.slice(0, 10),
          lastPageNumber: 1,
          pageNumber: 0,
          pageSize: 10,
          totalLength: 20
        }
      }).as('getPriorNotificationsFirstPage')
      cy.intercept('GET', `${apiPathBase}*pageNumber=0&pageSize=20*`, {
        body: {
          ...responseBody,
          data: fakeData.slice(0, 10),
          lastPageNumber: 1,
          pageNumber: 0,
          pageSize: 20,
          totalLength: 20
        }
      }).as('getPriorNotificationsSecondPage')

      openSideWindowPriorNotificationList()

      cy.wait('@getPriorNotificationsFirstPage')

      cy.get('button').contains('Charger les 10 préavis suivants').click()

      cy.wait('@getPriorNotificationsSecondPage')

      cy.get('button').contains('Charger les 10 préavis suivants').should('not.exist')
    })
  })
})
