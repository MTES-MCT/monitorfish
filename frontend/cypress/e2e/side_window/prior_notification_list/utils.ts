import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'
import { openSideWindowAsSuperUser, openSideWindowAsUser } from '../utils'

export const openSideWindowPriorNotificationListAsUser = openSideWindowAsUser

export const openSideWindowPriorNotificationListAsSuperUser = () => {
  openSideWindowAsSuperUser()

  cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(1000)
}
