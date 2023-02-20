/// <reference types="cypress" />

import { Mission } from 'src/domain/types/mission'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'

context('Side Window > Mission Form > Land Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.LAND)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle à la débarque')
  })

  it('Should enable or disable under JDP checkbox depending on other field values', () => {
    // -------------------------------------------------------------------------
    // Form

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    // Obligations déclaratives et autorisations de pêche
    cy.fill('Bonne émission VMS', 'Oui')
    cy.fill('Bonne émission AIS', 'Non')
    cy.fill('Déclarations journal de pêche conformes à l’activité du navire', 'Non concerné')
    cy.fill('Autorisations de pêche conformes à l’activité du navire (zone, engins, espèces)', 'Non')
    cy.clickButton('Ajouter une infraction obligations déclaratives / autorisations')
    cy.fill('Type d’infraction', 'Avec PV')
    cy.fill('NATINF', '23581')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction déclarative.')
    cy.clickButton('Valider l’infraction')
    cy.fill(
      'Observations (hors infractions) sur les obligations déclaratives / autorisations',
      'Une observation hors infraction sur les obligations déclaaratives.'
    )

    // Engins à bord
    cy.fill('Ajouter un engin', 'MIS')

    // Espèces à bord
    cy.fill('Ajouter une espèce', 'COD')
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')
    cy.fill('Qté déclarée', 10)
    cy.fill('Qté estimée', 20)
    cy.fill('Sous-taille', true)
    cy.clickButton('Ajouter une infraction espèces')
    cy.fill('Type d’infraction', 'Sans PV')
    cy.fill('NATINF', '23588')
    cy.fill('Appréhension espèces', true)
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction espèce.')
    cy.clickButton('Valider l’infraction')
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhension et déroutement du navire
    cy.fill('Appréhension et déroutement du navire', true)

    // Autres infractions
    cy.clickButton('Ajouter une autre infraction')
    cy.fill('Type d’infraction', 'Sans PV')
    cy.fill('NATINF', '27689')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction autre.')
    cy.clickButton('Valider l’infraction')

    // Autres observations
    cy.fill('Autres observations', 'Une autre observation.')

    // Segment de flotte
    cy.fill('Ajouter un segment', 'ATL01')

    // Qualité du contrôle
    cy.fill('Navire ciblé par le CNSP', 'Oui')
    cy.fill('Unité sans jauge oméga', true)
    cy.fill('Observations sur le déroulé du contrôle', 'Une observation sur le déroulé du contrôle.')
    cy.fill('Fiche RETEX nécessaire', true)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      // TODO This should be removed once the API works as expected.
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // actionDatetimeUtc: '2023-02-18T12:09:45.874Z',
        actionType: 'LAND_CONTROL',
        controlQualityComments: 'Une observation sur le déroulé du contrôle.',
        controlUnits: [],
        diversion: null,
        emitsAis: 'NO',
        emitsVms: 'YES',
        externalReferenceNumber: 'DONTSINK',
        facade: null,
        feedbackSheetRequired: true,
        flagState: 'FR',
        gearInfractions: [],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: null,
            gearCode: 'MIS',
            gearName: 'Engin divers',
            gearWasControlled: null
          }
        ],
        id: null,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isFromPoseidon: null,
        latitude: null,
        licencesAndLogbookObservations: 'Une observation hors infraction sur les obligations déclaaratives.',
        licencesMatchActivity: 'NO',
        logbookInfractions: [
          { comments: 'Une observation sur l’infraction déclarative.', infractionType: 'WITH_RECORD', natinf: 23581 }
        ],
        logbookMatchesActivity: 'NOT_APPLICABLE',
        longitude: null,
        missionId: 1,
        numberOfVesselsFlownOver: null,
        otherComments: 'Une autre observation.',
        otherInfractions: [
          { comments: 'Une observation sur l’infraction autre.', infractionType: 'WITHOUT_RECORD', natinf: 27689 }
        ],
        portLocode: null,
        portName: null,
        segments: [
          {
            faoAreas: ['37.1', '37.2', '37.3', '27.8.a', '27.8.b', '27.7.h', '27.7.e', '27.7.d'],
            segment: 'FR_ELE',
            segmentName: 'Eel sea fisheries'
          },
          {
            faoAreas: ['27.8.a', '27.8.b', '27.7.h', '27.7.e', '27.7.d', '27.4.c'],
            segment: 'FR_SCE',
            segmentName: 'Scallop fisheries'
          },
          { faoAreas: ['27.8.c', '27.8', '27.9'], segment: 'SWW01/02/03', segmentName: 'Bottom trawls' },
          { faoAreas: ['27.8.c', '27.8'], segment: 'SWW04', segmentName: 'Midwater trawls' },
          { faoAreas: ['27.8.c', '27.8', '27.9'], segment: 'SWW06', segmentName: 'Seines' },
          { faoAreas: ['27.8.c', '27.8', '27.9'], segment: 'SWW07/08', segmentName: 'Gill and trammel nets' },
          { faoAreas: ['27.8.c', '27.8', '27.9'], segment: 'SWW10', segmentName: 'Longlines targeting demersal' },
          {
            faoAreas: ['27.8.c', '27.8', '27.9'],
            segment: 'SWW11',
            segmentName: 'Hooks and Lines targeting GFB and ALF'
          },
          { faoAreas: ['27.7', '27.8', '27.9', '27.10'], segment: 'ATL01', segmentName: 'All Trawls 3' }
        ],
        seizureAndDiversion: true,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: true,
        speciesInfractions: [
          {
            comments: 'Une observation sur l’infraction espèce.',
            infractionType: 'WITHOUT_RECORD',
            natinf: 23588,
            speciesSeized: true
          }
        ],
        speciesObservations: 'Une observation hors infraction sur les espèces.',
        speciesOnboard: [
          { controlledWeight: 20, declaredWeight: 10, nbFish: null, speciesCode: 'COD', underSized: true }
        ],
        speciesSizeControlled: false,
        speciesWeightControlled: true,
        unitWithoutOmegaGauge: true,
        userTrigram: 'Marlin',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: true
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
