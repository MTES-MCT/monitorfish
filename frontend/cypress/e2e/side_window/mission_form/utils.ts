import { SideWindowMenuLabel } from '@features/SideWindow/constants'

import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

import type { Mission } from '@features/Mission/mission.types'

/**
 * Adds a species/discard row through its in-table add button, then picks its species by exact code.
 *
 * A new row opens its species picker with the caret already in the search input (issue #5391), so the code
 * is typed straight away, without clicking the picker first.
 *
 * `cy.fill('Espèce', code)` can't be used here: its Select handler clicks the first option whose text
 * *contains* the typed value, so typing "COD" matches "SMS - SAC**COD**ERMA …" before "COD - MORUE …".
 * Clicking the option whose label starts with the exact "<code> - " makes the pick deterministic.
 */
export const addSpeciesRow = (addButtonLabel: string, rowDataCy: string, code: string) => {
  cy.clickButton(addButtonLabel)
  cy.get(`[data-cy="${rowDataCy}"]`).find('input[role="searchbox"]').should('have.focus')
  cy.get('.rs-picker-popup')
    .filter(':visible')
    .last()
    .within(() => {
      cy.get('input[role="searchbox"]').type(code, { force: true }).wait(250)
      cy.contains('[role="option"]', new RegExp(`^${code} - `)).click({ force: true })
    })
}

/**
 * The mocked `EventSource` is keyed by the URL the app connected to, which depends on
 * `FRONTEND_MONITORENV_URL` (`http://0.0.0.0:8081` on the CI, `//localhost:8081` locally).
 */
export const getMissionSseSource = (mockEventSources: Record<string, any>) => {
  const sseUrl = Object.keys(mockEventSources).find(url => url.includes('/api/v1/missions/sse'))
  assert.isDefined(sseUrl, 'The app should have opened an SSE connection to the missions endpoint.')

  return mockEventSources[sseUrl!]
}

export const openSideWindowNewMission = () => {
  cy.viewport(1920, 1080)

  cy.login('superuser')
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

  cy.login('superuser')
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

  cy.fill('Sous JDP', true)

  cy.fill('Administration 1', 'DDTM')
  cy.fill('Unité 1', 'Cultures marines 56')
  cy.wait(500)
  cy.fill('Moyen 1', ['Brezel - FAH 7185'])

  const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
  cy.fill('Fin de mission', endDate.utcDateTupleWithTime)
}
