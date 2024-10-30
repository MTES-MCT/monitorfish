export const openBackOfficePriorNotificationSubscriberList = () => {
  cy.login('superuser')

  cy.intercept('GET', '/bff/v1/prior_notification_subscribers?sortColumn=CONTROL_UNIT_NAME&sortDirection=ASC').as(
    'getPriorNotificationSubscribers'
  )

  cy.visit('/backoffice/prior_notification_subscribers')
  cy.wait('@getPriorNotificationSubscribers')
}
