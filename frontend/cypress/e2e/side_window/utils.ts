import { SideWindowMenuLabel } from '../../../src/domain/entities/sideWindow/constants'

export const openSideWindowAsUser = () => {
  cy.intercept('/bff/v1/authorization/current', {
    body: {
      isSuperUser: false
    },
    statusCode: 200
  }).as('getIsSuperUser')

  cy.viewport(1920, 1080)
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}

export const openSideWindowAsSuperUser = () => {
  cy.viewport(1920, 1080)
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
}
