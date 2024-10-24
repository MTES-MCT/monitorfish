import { openSideWindowAsSuperUser, openSideWindowAsUser } from '../utils'

export const openSideWindowPriorNotificationListAsUser = openSideWindowAsUser

export const openSideWindowPriorNotificationListAsSuperUser = () => {
  openSideWindowAsSuperUser()

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(1000)
}
