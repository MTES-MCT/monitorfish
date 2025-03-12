import {SideWindowMenuLabel} from "@features/SideWindow/constants";

export const openSideWindowAlertList = () => {
  cy.viewport(1920, 1080)

  cy.login('superuser')
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.ALERT_LIST_AND_REPORTING_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}
