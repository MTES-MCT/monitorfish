import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

export const addManualSideWindowPriorNotification = () => {
  openSideWindowPriorNotificationListAsSuperUser()

  cy.clickButton('Ajouter un préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}
