import { SideWindowMenuLabel } from '../../../src/domain/entities/sideWindow/constants'

export const openSideWindowAsUser = () => {
  cy.viewport(1920, 1080)
  cy.login('user')
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}

export const openSideWindowAsSuperUser = () => {
  cy.viewport(1920, 1080)
  cy.login('superuser')
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
}
