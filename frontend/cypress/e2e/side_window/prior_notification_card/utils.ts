import { SideWindowMenuLabel } from 'domain/entities/sideWindow/constants'

export const editSideWindowPriorNotification = (vesselName: string) => {
  cy.viewport(1920, 1080)
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(1000)

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.clickButton('Consulter le préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(1000)
}