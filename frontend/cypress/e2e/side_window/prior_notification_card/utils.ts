import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'

export const openSideWindowPriorNotification = (vesselName: string, isSuperUser: boolean = true) => {
  cy.viewport(1920, 1080)
  cy.visit('/side_window')
  cy.wait(500)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  if (isSuperUser) {
    cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
  }
  cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  if (isSuperUser) {
    cy.clickButton('Éditer le préavis')
  } else {
    cy.clickButton('Consulter le préavis')
  }
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}
