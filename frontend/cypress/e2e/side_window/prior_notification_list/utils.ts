import { openSideWindowAsSuperUser, openSideWindowAsUser } from '../utils'
import {SideWindowMenuLabel} from "@features/SideWindow/constants";

export const openSideWindowPriorNotificationListAsUser = openSideWindowAsUser

export const openSideWindowPriorNotificationListAsSuperUser = () => {
  openSideWindowAsSuperUser()

  cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
}
