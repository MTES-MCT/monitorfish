/// <reference types="cypress" />

import { SideWindowMenuKey } from 'src/features/SideWindow/constants'

export const openSideWindowMissionList = () => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuKey.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}

export const editSideWindowMissionListMissionWithId = (missionId: number) => {
  openSideWindowMissionList()

  cy.get('.Table').find(`.TableBodyRow[data-id="${missionId}"]`).clickButton('Éditer la mission')

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}
