import { openBackOfficePriorNotificationSubscriberList } from '../prior_notification_subscriber_table/utils'

export const editBackOfficePriorNotificationSubscriber = (controlUnitId: number) => {
  cy.intercept('GET', `/bff/v1/prior_notification_subscribers/${controlUnitId}`).as('getPriorNotificationSubscriber')

  openBackOfficePriorNotificationSubscriberList()

  cy.getTableRowById(controlUnitId).clickButton('Éditer la diffusion pour cette unité de contrôle')
  cy.wait('@getPriorNotificationSubscriber')

  cy.get('[id="portSubscription"]').should('not.be.disabled')
  cy.get('[id="fullPortSubscription"]').should('not.be.disabled')
  cy.get('[id="fleetSegmentSubscription"]').should('not.be.disabled')
}
