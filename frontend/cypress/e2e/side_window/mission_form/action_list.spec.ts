// TODO We should find a way to either reset data after each test to make them independant and easily re-runnable or reset them via the UI (with e2e commands).
// https://glebbahmutov.com/blog/dependent-test/

import { SeaFrontGroup } from '../../../../src/constants'
import { editSideWindowMissionListMissionWithId } from '../mission_list/utils'

context('Side Window > Mission Form > Action List', () => {
  it('Should send the expected data to the API when duplicating a mission action', () => {
    editSideWindowMissionListMissionWithId(4, SeaFrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/4', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission4')
    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    cy.wait(250)

    cy.clickButton('Dupliquer l’action')

    cy.wait(250)

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.actionDatetimeUtc)
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: null,
        controlUnits: [],
        diversion: null,
        emitsAis: null,
        emitsVms: 'NOT_APPLICABLE',
        externalReferenceNumber: null,
        facade: 'Manche ouest - Mer du Nord',
        faoAreas: ['27.8.a'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
        gearOnboard: [],
        id: null,
        internalReferenceNumber: 'U_W0NTFINDME',
        ircs: null,
        isFromPoseidon: null,
        latitude: 53.35,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: 'NOT_APPLICABLE',
        logbookInfractions: [],
        logbookMatchesActivity: 'NOT_APPLICABLE',
        longitude: -10.85,
        missionId: 4,
        numberOfVesselsFlownOver: null,
        otherComments: 'Commentaires post contrôle',
        otherInfractions: [],
        portLocode: null,
        portName: null,
        segments: [],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: 'NO',
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: null,
        vesselId: 2,
        vesselName: 'MALOTRU',
        vesselTargeted: null
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should send the expected data to the API when deleting a mission action', () => {
    editSideWindowMissionListMissionWithId(34, SeaFrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/34', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission34')
    cy.intercept('DELETE', '/bff/v1/mission_actions/9').as('deleteMissionAction9')

    cy.wait(250)

    cy.clickButton('Supprimer l’action')

    cy.wait(250)

    cy.clickButton('Enregistrer')

    cy.wait('@deleteMissionAction9').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isEmpty(interception.request.body)
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
