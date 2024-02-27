import { SideWindowMenuLabel } from 'domain/entities/sideWindow/constants'

export const openSideWindowBeaconMalfunctionBoard = () => {
  cy.viewport(1920, 1080)

  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.BEACON_MALFUNCTION_BOARD)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}
