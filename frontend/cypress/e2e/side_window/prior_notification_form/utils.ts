import { SideWindowMenuLabel } from 'domain/entities/sideWindow/constants'

export const addSideWindowPriorNotification = () => {
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
  cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

  cy.clickButton('Ajouter un préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}

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
  cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.clickButton('Éditer le préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
}
