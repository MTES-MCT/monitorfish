// TODO We should find a way to either reset data after each test to make them independant and easily re-runnable or reset them via the UI (with e2e commands).
// https://glebbahmutov.com/blog/dependent-test/

import { openSideWindowNewMission } from './utils'
import { SeafrontGroup } from '../../../../src/constants/seafront'
import { editSideWindowMissionListMissionWithId } from '../mission_list/utils'

context('Side Window > Mission Form > Action List', () => {
  it('Should focus to the last action selected', () => {
    openSideWindowNewMission()

    cy.clickButton('Ajouter')

    cy.clickButton('Ajouter un contrôle en mer')
    cy.get('*[data-cy="action-list-item"]').contains('Contrôle en mer')
    cy.get('*[data-cy="action-list-item"]').should('have.css', 'outline', 'rgb(86, 151, 210) solid 2px')
    cy.getDataCy('action-completion-status').contains('12 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').eq(0).should('exist')

    cy.wait(250)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')

    cy.get('*[data-cy="action-list-item"]').eq(0).should('contain', 'Note libre à renseigner')

    cy.wait(250)
    cy.get('*[data-cy="action-list-item"]').eq(0).should('have.css', 'outline', 'rgb(86, 151, 210) solid 2px')
    cy.get('*[data-cy="action-list-item"]').eq(0).should('not.contain', 'Contrôle en mer')

    cy.get('*[data-cy="action-list-item"]').eq(1).should('not.have.css', 'outline', 'rgb(86, 151, 210) solid 2px')
    cy.get('*[data-cy="action-list-item"]').eq(1).contains('Contrôle en mer')
    cy.wait(250)

    cy.fill('Observations, commentaires...', 'Une observation.')
    cy.get('*[data-cy="action-list-item"]').eq(0).should('contain', 'Une observation.')

    cy.getDataCy('action-completion-status').contains('1 champ nécessaire aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').eq(1).should('exist')
  })

  it('Should send the expected data to the API when duplicating a mission action', () => {
    editSideWindowMissionListMissionWithId(4, SeafrontGroup.MEMN)

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

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          actionType: 'SEA_CONTROL',
          completedBy: null,
          completion: 'TO_COMPLETE',
          controlQualityComments: null,
          emitsAis: null,
          emitsVms: 'NOT_APPLICABLE',
          externalReferenceNumber: null,
          facade: 'MEMN',
          faoAreas: ['27.8.a'],
          flagState: 'FR',
          flightGoals: [],
          gearInfractions: [],
          gearOnboard: [],
          hasSomeGearsSeized: false,
          hasSomeSpeciesSeized: false,
          id: null,
          internalReferenceNumber: 'U_W0NTFINDME',
          ircs: null,
          isAdministrativeControl: null,
          isComplianceWithWaterRegulationsControl: null,
          isFromPoseidon: false,
          isSafetyEquipmentAndStandardsComplianceControl: null,
          isSeafarersControl: null,
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
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)

    // And we delete this action

    editSideWindowMissionListMissionWithId(4, SeafrontGroup.MEMN)

    cy.clickButton('Supprimer l’action', { index: 1 })

    cy.wait(250)
  })

  it('Should send the expected data to the API when deleting a mission action', () => {
    editSideWindowMissionListMissionWithId(34, SeafrontGroup.MEMN)

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

    cy.wait('@deleteMissionAction9').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isEmpty(interception.request.body)
    })
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

  it('Should re-compute or delete the mission geometry when the action is the last one', () => {
    editSideWindowMissionListMissionWithId(34, SeafrontGroup.MEMN)

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

    // We add another control
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')
    cy.fill('Navire inconnu', true)

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    cy.wait(500)
    cy.clickButton('Supprimer l’action')

    // There is still a valid control with a geometry that could be used for the mission zone
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été modifiée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    cy.wait(250)
    cy.clickButton('Supprimer l’action')

    cy.get('*[data-cy="mission-main-form-location"]').should(
      'not.contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )
  })

  it('Should show Env actions on the actions timeline', () => {
    editSideWindowMissionListMissionWithId(34, SeafrontGroup.MEMN)

    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(1).contains('28 Nov à 13:59')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(1).contains('Surveillance')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(2).contains('Action CACEM')

    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(3).contains('17 Nov à 13:59')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(3).contains('Contrôle')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(4).contains('Action CACEM')

    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(5).contains('03 Nov à 13:59')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(5).contains('Une note avec des informations')
    cy.get('[data-cy="mission-form-action-list"] > div').children().eq(6).contains('Action CACEM')
  })
})
