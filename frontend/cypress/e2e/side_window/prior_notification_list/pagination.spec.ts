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

  it('Should download all prior notifications matching the filters When all loaded rows are selected', () => {
    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    openSideWindowPriorNotificationListAsSuperUser()

    cy.wait('@getPriorNotifications').then(interception => {
      const responseBody: BackendApi.ResponseBodyPaginatedList<
        PriorNotification.PriorNotification,
        Logbook.ApiListExtraData
      > = interception.response!.body

      const fakeData = Array.from({ length: 100 }).map((_, index) => ({
        ...responseBody.data[0]!,
        reportId: `FAKE_REPORT_ID_${index}`
      }))

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
          data: fakeData,
          lastPageNumber: 0,
          pageNumber: 0,
          pageSize: 100,
          totalLength: 100
        },
        delay: 1000
      }).as('getAllPriorNotifications')

      openSideWindowPriorNotificationListAsSuperUser()

      cy.wait('@getPriorNotificationsFirstPage')

      cy.get('label').contains('Sélectionner tous les préavis').click({ force: true })
      cy.clickButton('Télécharger 100 préavis')

      cy.get('button[title="Téléchargement de 100 préavis en cours..."]').should('be.disabled')
      cy.get('[data-cy="prior-notification-list-downloading-icon"]').should('exist')

      cy.wait('@getAllPriorNotifications')

      cy.getDownloadedFileContent(content => {
        content.should('contain', 'FAKE_REPORT_ID_0').should('contain', 'FAKE_REPORT_ID_99')
      })

      cy.get('button[title="Télécharger 100 préavis"]').should('be.enabled')
      cy.get('[data-cy="prior-notification-list-downloading-icon"]').should('not.exist')
    })
  })
})
