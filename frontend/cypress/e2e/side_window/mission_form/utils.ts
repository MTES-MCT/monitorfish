import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'

import type { Mission } from '../../../../src/domain/entities/mission/types'

export const openSideWindowNewMission = () => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton('Ouvrir une nouvelle mission')

  cy.wait(500)
}

export const editSideWindowMission = (vesselName: string) => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.clickButton('Éditer la mission')

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}

export const fillSideWindowMissionFormBase = (
  missionTypeLabel: Mission.MissionTypeLabel,
  isReturningClosed: boolean = false
) => {
  cy.intercept('POST', '/api/v1/missions', {
    body: {
      id: 1,
      isClosed: isReturningClosed
    },
    statusCode: 201
  }).as('createMission')
  cy.intercept('GET', '/api/v1/missions/1', {
    body: {
      id: 1,
      isClosed: isReturningClosed
    },
    statusCode: 201
  }).as('getCreatedMission')
  cy.intercept('GET', '/bff/v1/mission_actions?missionId=1', {
    body: [{ id: 2 }],
    statusCode: 201
  }).as('getCreatedMissionActions')

  cy.fill('Types de mission', [missionTypeLabel])

  cy.fill('Mission sous JDP', true)

  cy.fill('Administration 1', 'DDTM')
  cy.fill('Unité 1', 'Cultures marines – DDTM 40')
  cy.fill('Moyen 1', ['Semi-rigide 2'])
}
