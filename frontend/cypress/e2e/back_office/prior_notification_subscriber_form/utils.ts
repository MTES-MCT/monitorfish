import dayjs from 'dayjs'

import { openBackOfficePriorNotificationSubscriberList } from '../prior_notification_subscriber_table/utils'

export const editBackOfficePriorNotificationSubscriber = (controlUnitId: number) => {
  cy.login('superuser')

  cy.intercept('GET', `/bff/v1/prior_notification_subscribers/${controlUnitId}`).as('getPriorNotificationSubscriber')
  cy.intercept('GET', `/bff/v1/fleet_segments/${dayjs().year()}`).as('getFleetSegments')
  cy.intercept('GET', `/bff/v1/ports`).as('getPorts')

  openBackOfficePriorNotificationSubscriberList()

  cy.getTableRowById(controlUnitId).clickButton('Éditer la diffusion pour cette unité de contrôle')
  cy.wait('@getPriorNotificationSubscriber')
  cy.wait('@getFleetSegments')
  cy.wait('@getPorts')

  cy.wait(1000)
}
