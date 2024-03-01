import EventSource, { sources } from 'eventsourcemock'

import { SeaFrontGroup } from '../../../../src/domain/entities/seaFront/constants'
import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'

export const openSideWindowMissionList = () => {
  cy.viewport(1920, 1080)

  cy.visit('/side_window', {
    onBeforeLoad(window) {
      Object.defineProperty(window, 'EventSource', { value: EventSource })
      Object.defineProperty(window, 'mockEventSources', { value: sources })
    }
  })

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}

export const editSideWindowMissionListMissionWithId = (missionId: number, seaFrontGroup?: SeaFrontGroup) => {
  openSideWindowMissionList()

  if (seaFrontGroup) {
    cy.getDataCy(`side-window-sub-menu-${seaFrontGroup}`).click()
  }

  cy.get('.Table').find(`.TableBodyRow[data-id="${missionId}"]`).clickButton('Éditer la mission')

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}
