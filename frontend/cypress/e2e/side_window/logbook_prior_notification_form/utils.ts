import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

// Both logbook and manual prior notifications
export const editSideWindowPriorNotification = (vesselName: string, reportId: string) => {
  openSideWindowPriorNotificationListAsSuperUser()

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.getTableRowById(reportId).clickButton('Éditer le préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}
