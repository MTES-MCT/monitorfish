import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

import type { Mission } from '@features/Mission/mission.types'

export const openSideWindowNewMission = () => {
  cy.viewport(1920, 1080)

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
  cy.viewport(1920, 1080)

  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.get('[data-cy="side-window-sub-menu-ALL_SEAFRONT_GROUP"]').click()
  cy.fill('Rechercher un navire', vesselName)

  cy.clickButton('Éditer la mission')

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}

export const fillSideWindowMissionFormBase = (
  missionTypeLabel: Mission.MissionTypeLabel,
  hasExistingActions: boolean = true
) => {
  cy.intercept('POST', '/api/v1/missions', {
    body: {
      id: 1
    },
    statusCode: 201
  }).as('createMission')
  cy.intercept('GET', '/api/v1/missions/1', {
    body: {
      envActions: [],
      id: 1
    },
    statusCode: 201
  }).as('getCreatedMission')

  if (hasExistingActions) {
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=1', {
      body: [{ id: 2 }],
      statusCode: 200
    }).as('getCreatedMissionActions')
  } else {
    cy.intercept(
      { times: 1, url: '/bff/v1/mission_actions?missionId=1' },
      {
        body: [],
        statusCode: 200
      }
    ).as('getCreatedMissionActions')
  }

  cy.fill('Types de mission', [missionTypeLabel])

  cy.fill('Mission sous JDP', true)

  cy.fill('Administration 1', 'DDTM')
  cy.fill('Unité 1', 'Cultures marines 56')
  cy.wait(500)
  cy.fill('Moyen 1', ['Brezel - FAH 7185'])

  const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
  cy.fill('Fin de mission', endDate.utcDateTupleWithTime)
}
