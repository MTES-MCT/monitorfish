// TODO We should find a way to either reset data after each test to make them independant and easily re-runnable or reset them via the UI (with e2e commands).
// https://glebbahmutov.com/blog/dependent-test/

import { openSideWindowNewMission } from './utils'
import { SeaFrontGroup } from '../../../../src/domain/entities/seaFront/constants'
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
    cy.get('*[data-cy="action-list-item"]').click()

    cy.wait(250)

    cy.clickButton('Dupliquer l’action')

    cy.wait(250)

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.actionDatetimeUtc)
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        closedBy: null,
        controlQualityComments: null,
        controlUnits: [],
        emitsAis: null,
        emitsVms: 'NOT_APPLICABLE',
        externalReferenceNumber: null,
        facade: 'MEMN',
        faoAreas: ['27.8.a'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        flightGoals: [],
        gearInfractions: [],
        gearOnboard: [],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: false,
        id: null,
        internalReferenceNumber: 'U_W0NTFINDME',
        ircs: null,
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
        userTrigram: 'JKL',
        vesselId: 2,
        vesselName: 'MALOTRU',
        vesselTargeted: 'YES'
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')

    // And we delete this action

    editSideWindowMissionListMissionWithId(4, SeaFrontGroup.MEMN)

    cy.clickButton('Supprimer l’action', { index: 1 })

    cy.wait(250)

    cy.clickButton('Enregistrer et quitter')
  })

  it('Should send the expected data to the API when deleting a mission action', () => {
    editSideWindowMissionListMissionWithId(34, SeaFrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/34', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission34')
    cy.intercept('DELETE', '/bff/v1/mission_actions/9', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('deleteMissionAction9')

    cy.wait(250)

    cy.clickButton('Supprimer l’action')

    cy.wait(250)

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@deleteMissionAction9').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isEmpty(interception.request.body)
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should show the expected infraction tags', () => {
    openSideWindowNewMission()

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Avec PV')
    cy.fill('Catégorie d’infraction', 'Infraction obligations déclaratives et autorisations de pêche')
    cy.fill('NATINF', '23581')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Avec PV')
    cy.fill('Catégorie d’infraction', 'Infraction obligations déclaratives et autorisations de pêche')
    cy.fill('NATINF', '23588')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Catégorie d’infraction', 'Infraction obligations déclaratives et autorisations de pêche')
    cy.fill('NATINF', '23584')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'En attente')
    cy.fill('Catégorie d’infraction', 'Infraction obligations déclaratives et autorisations de pêche')
    cy.clickButton('Valider l’infraction')

    cy.get('.Element-Tag').contains('2 INF AVEC PV').should('be.visible')
    cy.get('.Element-Tag').contains('1 INF EN ATTENTE').should('be.visible')
    cy.get('.Element-Tag').contains('3 NATINF: 23581, 23588, 23584').should('be.visible')
    // The infractions label from natinfs should be rendered
    cy.get(
      '[title="23581 - Taille de maille non réglementaire, 23588 - Chalutage dans la zone des 3 milles, 23584 - Défaut AIS"]'
    ).should('exist')
  })
})
