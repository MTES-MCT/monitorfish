import { SideWindowMenuKey } from '../../../../src/features/SideWindow/constants'

import type { Mission } from '../../../../src/domain/entities/mission/types'

export const openSideWindowNewMission = () => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuKey.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton('Ajouter une nouvelle mission')

  cy.wait(500)
}

export const editSideWindowMission = (vesselName: string) => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuKey.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.fill('Rechercher un navire', vesselName)

  cy.clickButton('Éditer la mission')

  cy.wait(500)
}

export const fillSideWindowMissionFormBase = (missionTypeLabel: Mission.MissionTypeLabel) => {
  cy.intercept('POST', '/api/v1/missions', {
    body: {
      id: 1
    },
    statusCode: 201
  }).as('createMission')

  cy.fill('Types de mission', [missionTypeLabel])

  cy.fill('Mission sous JDP', true)

  cy.fill('Administration 1', 'DDTM')
  cy.fill('Unité 1', 'Cultures marines – DDTM 40')
  cy.fill('Moyen 1', ['Semi-rigide 2'])
}
