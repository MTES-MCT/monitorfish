import { FAKE_PRIOR_NOTIFICATION_SUBSCRIBERS } from './constants'
import { FAKE_ADMINISTRATIONS } from '../../constants'

export const openBackOfficePriorNotificationSubscriberList = () => {
  cy.intercept(
    '/bff/v1/prior_notification_subscribers?sortColumn=CONTROL_UNIT_NAME&sortDirection=ASC',
    FAKE_PRIOR_NOTIFICATION_SUBSCRIBERS
  ).as('getPriorNotificationSubscribers')
  cy.intercept('http://localhost:9880/api/v1/administrations', FAKE_ADMINISTRATIONS).as('getAdministrations')

  cy.visit('/backoffice/prior_notification_subscribers')
  cy.wait('@getPriorNotificationSubscribers')
}
