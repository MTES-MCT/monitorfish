import { getPseudoRandomString } from '@mtes-mct/monitor-ui'

import { openSideWindowPriorNotificationListAsSuperUser } from './utils'

import type { BackendApi } from '@api/BackendApi.types'
import type { Logbook } from '@features/Logbook/Logbook.types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

context('Side Window > Prior Notification List > Pagination', () => {
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should filter prior notifications by seafront group', () => {
    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    openSideWindowPriorNotificationListAsSuperUser()

    cy.wait('@getPriorNotifications').then(interception => {
      const responseBody: BackendApi.ResponseBodyPaginatedList<
        PriorNotification.PriorNotification,
        Logbook.ApiListExtraData
      > = interception.response!.body

      const fakeData = Array.from({ length: 100 }).flatMap(() =>
        responseBody.data.map(priorNotification => ({
          ...priorNotification,
          id: getPseudoRandomString()
        }))
      )

      cy.intercept('GET', `${apiPathBase}*pageNumber=0&pageSize=50*`, {
        body: {
          ...responseBody,
          data: fakeData.slice(0, 50),
          lastPageNumber: 1,
          pageNumber: 0,
          pageSize: 50,
          totalLength: 100
        }
      }).as('getPriorNotificationsFirstPage')
      cy.intercept('GET', `${apiPathBase}*pageNumber=0&pageSize=100*`, {
        body: {
          ...responseBody,
          data: fakeData.slice(0, 100),
          lastPageNumber: 1,
          pageNumber: 0,
          pageSize: 100,
          totalLength: 100
        }
      }).as('getPriorNotificationsSecondPage')

      openSideWindowPriorNotificationListAsSuperUser()

      cy.wait('@getPriorNotificationsFirstPage')

      cy.get('button').contains('Charger les 50 préavis suivants').click()

      cy.wait('@getPriorNotificationsSecondPage')

      cy.get('button').contains('Charger les 50 préavis suivants').should('not.exist')
    })
  })
})
