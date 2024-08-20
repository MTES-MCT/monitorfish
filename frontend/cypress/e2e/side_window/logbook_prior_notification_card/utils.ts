import { openSideWindowPriorNotificationListAsUser } from '../prior_notification_list/utils'

// Cards can only be opened as User, SuperUser open them as forms
export const openSideWindowPriorNotificationCardAsUser = (vesselName: string, reportId: string) => {
  openSideWindowPriorNotificationListAsUser()

  cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.getTableRowById(reportId as any).clickButton('Consulter le préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}
