/// <reference types="cypress" />

import { SideWindowMenuKey } from 'src/features/SideWindow/constants'

import type { Mission } from 'src/domain/types/mission'

export const openSideWindowNewMission = () => {
  cy.visit('/side_window')

  cy.wait(500)

  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton(SideWindowMenuKey.MISSION_LIST).click()
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }
  cy.clickButton('Ajouter une nouvelle mission')

  cy.wait(500)
}

export const fillSideWindowMissionFormBase = (missionTypeLabel: Mission.MissionTypeLabel) => {
  // TODO This should be removed once the API works as expected.
  cy.intercept('PUT', '/api/v1/missions', {
    body: {
      id: 1
    },
    statusCode: 201
  })

  cy.fill('Type de mission', missionTypeLabel)

  cy.fill('Intentions principales de mission', ['Pêche'])
  cy.fill('Mission sous JDP', true)

  cy.fill('Administration 1', 'DDTM')
  cy.fill('Unité 1', 'Cultures marines – DDTM 40')
  cy.fill('Ressource 1', ['Semi-rigide 2'])
}
