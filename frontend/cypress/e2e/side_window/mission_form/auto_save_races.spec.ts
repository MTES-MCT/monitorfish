import { Mission } from '@features/Mission/mission.types'
import { SideWindowMenuLabel } from '@features/SideWindow/constants'
import EventSource, { sources } from 'eventsourcemock'

import { openSideWindowNewMission } from './utils'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

/**
 * Same as `openSideWindowNewMission()`, with a mocked `EventSource` so that the test can emit the
 * mission update events MonitorEnv normally pushes.
 */
const openSideWindowNewMissionWithMockedEventSource = () => {
  cy.viewport(1920, 1080)

  cy.login('superuser')
  cy.visit('/side_window', {
    onBeforeLoad(window) {
      Object.defineProperty(window, 'EventSource', { value: EventSource })
      Object.defineProperty(window, 'mockEventSources', { value: sources })
    }
  })

  cy.wait(500)
  cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
  cy.clickButton('Ouvrir une nouvelle mission')
  cy.wait(500)
}

/**
 * The mocked `EventSource` is keyed by the URL the app connected to, which depends on
 * `FRONTEND_MONITORENV_URL` (`http://0.0.0.0:8081` on the CI, `//localhost:8081` locally).
 */
const emitMissionUpdate = (mission: Record<string, unknown>) => {
  cy.window()
    .its('mockEventSources' as any)
    .then(mockEventSources => {
      const sseUrl = Object.keys(mockEventSources).find(url => url.includes('/api/v1/missions/sse'))
      assert.isDefined(sseUrl, 'The app should have opened an SSE connection to the missions endpoint.')

      mockEventSources[sseUrl!].emitOpen()
      mockEventSources[sseUrl!].emit(
        'MISSION_UPDATE',
        new MessageEvent('MISSION_UPDATE', { data: JSON.stringify(mission) })
      )
    })
}

/**
 * Regression tests for https://github.com/MTES-MCT/monitorfish/issues/5368.
 *
 * Auto-save fires on every typing pause, so a second save can start while the first one is still in
 * flight. The entity was then created twice — the duplicated mission and the duplicated control the
 * ops team reported — since the id of the first (unfinished) creation was not known yet, and what
 * was typed meanwhile was lost when the form was reinitialized with the values of the first save.
 *
 * The creation responses are deliberately slowed down (`delay`) to make that overlap deterministic,
 * the way a slow intranet connection makes it happen in production.
 */
context('Side Window > Mission Form > Auto Save Races', () => {
  it('Should create the mission only once when the form is edited while its creation is still in flight', () => {
    openSideWindowNewMission()

    const createdAtUtc = customDayjs().utc().format('YYYY-MM-DDTHH:mm:ss.000Z')
    cy.intercept('POST', '/api/v1/missions', {
      body: { createdAtUtc, id: 1, updatedAtUtc: createdAtUtc },
      // Long enough for the next edit to be auto-saved while this creation is still in flight
      delay: 4000,
      statusCode: 201
    }).as('createMission')
    cy.intercept('POST', '/api/v1/missions/1', {
      body: { id: 1, updatedAtUtc: customDayjs().utc().add(1, 'minute').format('YYYY-MM-DDTHH:mm:ss.000Z') },
      statusCode: 200
    }).as('updateMission')
    cy.intercept('GET', '/bff/v1/missions/1', {
      body: { envActions: [], id: 1 },
      statusCode: 200
    })
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=1', {
      body: [],
      statusCode: 200
    })

    // Filling the last required field makes the main form valid, which triggers the (slow) creation
    cy.fill(
      'Fin de mission',
      getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString()).utcDateTupleWithTime
    )
    cy.fill('Types de mission', [Mission.MissionTypeLabel.SEA])
    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines 56')

    // The creation request has started but has not answered yet
    cy.wait(1500)

    // The operator keeps filling the left column while the mission is being created
    cy.fill('Ouvert par', 'CAR')

    // Let the creation answer and every pending auto-save settle
    cy.wait(6000)

    // Without the fix, this second edit would have created a whole second mission
    cy.get('@createMission.all').should('have.length', 1)
    // ...it must still be displayed, and not silently erased once the creation answers
    cy.get('input[name="openBy"]').should('have.value', 'CAR')
    // ...and it must have been persisted, as an update of the created mission
    cy.waitForLastRequest('@updateMission', { body: { openBy: 'CAR' } }, 5)
  })

  it('Should create the action only once when the form is edited while its creation is still in flight', () => {
    openSideWindowNewMission()

    cy.intercept('POST', '/api/v1/missions', {
      body: { id: 1 },
      statusCode: 201
    }).as('createMission')
    cy.intercept('GET', '/bff/v1/missions/1', {
      body: { envActions: [], id: 1 },
      statusCode: 200
    })
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=1', {
      body: [],
      statusCode: 200
    })

    cy.fill(
      'Fin de mission',
      getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString()).utcDateTupleWithTime
    )
    cy.fill('Types de mission', [Mission.MissionTypeLabel.SEA])
    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines 56')
    cy.wait('@createMission')
    cy.wait(500)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: { id: 2 },
      // Long enough for the next edit to be auto-saved while this creation is still in flight
      delay: 4000,
      statusCode: 201
    }).as('createMissionAction')
    cy.intercept('PUT', '/bff/v1/mission_actions/2', {
      body: { id: 2 },
      statusCode: 201
    }).as('updateMissionAction')

    // A free note only needs its trigram to be valid, so this triggers the (slow) creation
    cy.fill('Saisi par', 'CAR')

    // The creation request has started but has not answered yet
    cy.wait(1500)

    // The operator keeps filling the action while it is being created
    cy.fill('Observations, commentaires...', 'Une observation saisie pendant la création.')

    // Let the creation answer and every pending auto-save settle
    cy.wait(6000)

    // Without the fix, this second edit would have created a whole second action (the duplicated control)
    cy.get('@createMissionAction.all').should('have.length', 1)
    // ...and it must still have been persisted, as an update of the created action
    cy.waitForLastRequest(
      '@updateMissionAction',
      { body: { otherComments: 'Une observation saisie pendant la création.' } },
      5
    )
  })

  it('Should not erase what the operator is typing with the echo of the form own save', () => {
    openSideWindowNewMissionWithMockedEventSource()

    const createdAtUtc = '2026-08-26T05:41:40.000000Z'
    const lastSavedUpdatedAtUtc = '2026-08-26T05:41:50.000000Z'
    const endDateTimeUtc = customDayjs().utc().add(7, 'day').toISOString()
    cy.intercept('POST', '/api/v1/missions', {
      body: { createdAtUtc, id: 1, updatedAtUtc: createdAtUtc },
      statusCode: 201
    }).as('createMission')
    cy.intercept('POST', '/api/v1/missions/1', {
      body: { id: 1, updatedAtUtc: lastSavedUpdatedAtUtc },
      statusCode: 200
    }).as('updateMission')
    cy.intercept('GET', '/bff/v1/missions/1', { body: { envActions: [], id: 1 }, statusCode: 200 })
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=1', { body: [], statusCode: 200 })

    cy.fill('Fin de mission', getUtcDateInMultipleFormats(endDateTimeUtc).utcDateTupleWithTime)
    cy.fill('Types de mission', [Mission.MissionTypeLabel.SEA])
    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines 56')
    cy.wait('@createMission')
    // Let the form settle on the created mission before typing, this test is about the echo only
    cy.wait(1500)

    // The operator fills the unit contact, which is auto-saved
    cy.fill('Ouvert par', 'CAR')
    cy.waitForLastRequest('@updateMission', { body: { openBy: 'CAR' } }, 5)
    // Let the form start listening to events again after the save
    cy.wait(1000)

    /**
     * The SSE echo of that very save comes back. It carries the mission as of that save — here
     * without the field just filled, which is what an overlapping save echoes in production.
     * It must not be written over what the operator has typed since.
     */
    emitMissionUpdate({
      controlUnits: [
        {
          administration: 'DDTM',
          contact: null,
          id: 10499,
          isArchived: false,
          name: 'Cultures marines 56',
          resources: []
        }
      ],
      endDateTimeUtc,
      envActions: [],
      id: 1,
      isGeometryComputedFromControls: true,
      isUnderJdp: false,
      missionSource: 'MONITORFISH',
      missionTypes: ['SEA'],
      // STALE FIELD: the mission as it was before the operator filled it
      openBy: undefined,
      updatedAtUtc: lastSavedUpdatedAtUtc
    })
    cy.wait(1000)

    // Without the fix, the echo would have erased the field the operator had just filled
    cy.get('input[name="openBy"]').should('have.value', 'CAR')
  })
})
