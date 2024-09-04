import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Land Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.LAND)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle à la débarque')
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.getDataCy('action-completion-status').contains('13 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')

    const now = getUtcDateInMultipleFormats()
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('createMissionAction')
    cy.intercept('PUT', '/bff/v1/mission_actions/2', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno').wait(250)
    cy.contains('mark', 'PHENO').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // Port de contrôle
    // Try to select a port with custom search (the "-" missing but the port should be found)
    cy.get('#port').parent().click({ force: true })
    cy.get('.rs-search-box-input').type('saintmalo{enter}', { force: true })
    // Should select the right port
    cy.get('.Field-Select').contains('Saint-Malo (FRSML)')

    // Get the actual port for this test case
    cy.fill('Port de contrôle', 'Auray')

    // Obligations déclaratives et autorisations de pêche
    cy.fill('Bonne émission VMS', 'Oui')
    cy.fill('Bonne émission AIS', 'Non')
    cy.fill('Déclarations journal de pêche conformes à l’activité du navire', 'Non concerné')
    cy.fill('Autorisations de pêche conformes à l’activité du navire (zone, engins, espèces)', 'Non')
    cy.fill(
      'Observations (hors infractions) sur les obligations déclaratives / autorisations',
      'Une observation hors infraction sur les obligations déclaaratives.'
    )

    // Engins à bord
    cy.fill('Ajouter un engin', 'MIS')
    cy.fill('Engin contrôlé', 'Oui')
    cy.get('[name="gearOnboard[1].gearWasControlled"]').eq(1).click()

    // Espèces à bord
    cy.fill('Ajouter une espèce', 'COD')
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')
    cy.fill('Qté pesée', 500)
    cy.fill('Sous-taille', true)
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhensions
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
    cy.fill('Quantités saisies (kg)', 6289.5)
    cy.fill('Appréhension du navire', true)

    // Infractions
    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Avec PV')
    cy.fill('Catégorie d’infraction', 'Infraction obligations déclaratives et autorisations de pêche')
    cy.fill('NATINF', '23581')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction déclarative.')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Catégorie d’infraction', 'Infraction espèces')
    cy.fill('NATINF', '23588')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction espèce.')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Catégorie d’infraction', 'Autre infraction')
    cy.fill('NATINF', '27689')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction autre.')
    cy.clickButton('Valider l’infraction')

    // Autres observations
    cy.fill('Autres observations', 'Une autre observation.')

    // Qualité du contrôle
    cy.fill('Navire ciblé par le CNSP', 'Oui')
    cy.fill('Unité sans jauge oméga', true)
    cy.fill('Observations sur le déroulé du contrôle', 'Une observation sur le déroulé du contrôle.')
    cy.fill('Fiche RETEX nécessaire', true)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // Complété par
    cy.fill('Complété par', 'Alice', { index: 1 })

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
          actionType: 'LAND_CONTROL',
          completedBy: 'Alice',
          completion: 'COMPLETED',
          controlQualityComments: 'Une observation sur le déroulé du contrôle.',
          controlUnits: [],
          districtCode: 'AY',
          emitsAis: 'NO',
          emitsVms: 'YES',
          externalReferenceNumber: 'DONTSINK',
          facade: null,
          faoAreas: ['27.8.b', '27.8.c'],
          feedbackSheetRequired: true,
          flagState: 'FR',
          gearInfractions: [],
          gearOnboard: [
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: 70,
              gearCode: 'OTB',
              gearName: 'Chaluts de fond à panneaux',
              gearWasControlled: true,
              hasUncontrolledMesh: false
            },
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: null,
              gearCode: 'MIS',
              gearName: 'Engin divers',
              gearWasControlled: false,
              hasUncontrolledMesh: false
            }
          ],
          hasSomeGearsSeized: true,
          hasSomeSpeciesSeized: true,
          id: 2,
          internalReferenceNumber: 'FAK000999999',
          ircs: 'CALLME',
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
          portLocode: 'FRZEG',
          segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
          seizureAndDiversion: true,
          seizureAndDiversionComments: null,
          separateStowageOfPreservedSpecies: 'YES',
          speciesInfractions: [
            {
              comments: 'Une observation sur l’infraction espèce.',
              infractionType: 'WITHOUT_RECORD',
              natinf: 23588
            }
          ],
          speciesObservations: 'Une observation hors infraction sur les espèces.',
          speciesOnboard: [
            { controlledWeight: 500, declaredWeight: 471.2, nbFish: null, speciesCode: 'HKE', underSized: true },
            { controlledWeight: null, declaredWeight: 13.46, nbFish: null, speciesCode: 'BLI', underSized: false },
            { controlledWeight: null, declaredWeight: null, nbFish: null, speciesCode: 'COD', underSized: false }
          ],
          speciesQuantitySeized: 6289.5,
          speciesSizeControlled: false,
          speciesWeightControlled: true,
          unitWithoutOmegaGauge: true,
          userTrigram: 'Marlin',
          vesselId: 1,
          vesselName: 'PHENOMENE',
          vesselTargeted: 'YES'
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)

    cy.getDataCy('action-completion-status').contains('Les champs nécessaires aux statistiques sont complétés.')
    cy.getDataCy('action-all-fields-completed').should('exist')
  })

  it('Should fill the mission zone from the last land control added', () => {
    const now = getUtcDateInMultipleFormats()

    cy.intercept('POST', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    cy.intercept('POST', '/api/v1/missions/1', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno').wait(250)
    cy.contains('mark', 'PHENO').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // Port de contrôle
    cy.fill('Port de contrôle', 'Auray')

    // A mission zone should be automatically added
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été modifiée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // Add another land control
    cy.clickButton('Ajouter')
    cy.wait(200)
    cy.wait(200)
    cy.clickButton('Ajouter un contrôle à la débarque')

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('FR263418260').wait(250)
    cy.contains('mark', 'FR263418260').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // Port de contrôle
    cy.fill('Port de contrôle', 'Abu Musa')

    // The mission zone should be automatically updated
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été modifiée à partir des contrôles de la mission'
    )

    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMission',
      {
        body: {
          controlUnits: [
            {
              administration: 'DDTM',
              contact: null,
              id: 10499,
              isArchived: false,
              name: 'Cultures marines 56',
              resources: [
                {
                  id: 314,
                  name: 'Brezel - FAH 7185'
                }
              ]
            }
          ],
          geom: {
            coordinates: [
              [
                [
                  [55.08333333333329, 25.884653073941166],
                  [55.08529290249072, 25.88456645131835],
                  [55.08723359137199, 25.884307418052217],
                  [55.08913670185736, 25.883878469897553],
                  [55.09098389837308, 25.883283739682923],
                  [55.09275738476446, 25.882528957439064],
                  [55.094440075937975, 25.881621395121172],
                  [55.09601576260965, 25.880569796460932],
                  [55.09746926756488, 25.879384292628544],
                  [55.09878659191884, 25.878076304521514],
                  [55.099955049965395, 25.87665843262735],
                  [55.10096339131462, 25.87514433552593],
                  [55.101801909143674, 25.87354859820782],
                  [55.102462533522775, 25.871886591481854],
                  [55.10293890892297, 25.870174323831094],
                  [55.10322645516764, 25.868428287148475],
                  [55.1033224112508, 25.866665297840726],
                  [55.10322586161085, 25.864902334834582],
                  [55.10293774461942, 25.863156376045993],
                  [55.10246084321602, 25.86144423488838],
                  [55.101799757791206, 25.85978239839345],
                  [55.100960861591695, 25.8581868685025],
                  [55.09995223908787, 25.85667300805298],
                  [55.09878360790714, 25.85525539294113],
                  [55.09746622509289, 25.853947671878814],
                  [55.09601277859787, 25.852762435091137],
                  [55.0944372650603, 25.851711093213254],
                  [55.092754855041356, 25.850803767547305],
                  [55.090981747020415, 25.850049192730594],
                  [55.0891350115504, 25.849454632747054],
                  [55.08723242706828, 25.84902581108551],
                  [55.08529230893384, 25.848766855713464],
                  [55.08333333333329, 25.84868025939221],
                  [55.08137435773278, 25.848766855713464],
                  [55.079434239598314, 25.84902581108551],
                  [55.07753165511621, 25.849454632747054],
                  [55.0756849196462, 25.850049192730594],
                  [55.07391181162526, 25.850803767547305],
                  [55.07222940160631, 25.851711093213254],
                  [55.07065388806872, 25.852762435091137],
                  [55.06920044157371, 25.853947671878814],
                  [55.06788305875946, 25.85525539294113],
                  [55.06671442757873, 25.85667300805298],
                  [55.065705805074906, 25.8581868685025],
                  [55.064866908875395, 25.85978239839345],
                  [55.06420582345059, 25.86144423488838],
                  [55.06372892204719, 25.863156376045993],
                  [55.063440805055755, 25.864902334834582],
                  [55.0633442554158, 25.866665297840726],
                  [55.06344021149896, 25.868428287148475],
                  [55.06372775774364, 25.870174323831094],
                  [55.06420413314383, 25.871886591481854],
                  [55.06486475752294, 25.87354859820782],
                  [55.06570327535199, 25.87514433552593],
                  [55.06671161670122, 25.87665843262735],
                  [55.06788007474777, 25.878076304521514],
                  [55.06919739910172, 25.879384292628544],
                  [55.07065090405695, 25.880569796460932],
                  [55.07222659072864, 25.881621395121172],
                  [55.07390928190215, 25.882528957439064],
                  [55.075682768293504, 25.883283739682923],
                  [55.07752996480924, 25.883878469897553],
                  [55.079433075294624, 25.884307418052217],
                  [55.081373764175886, 25.88456645131835],
                  [55.08333333333329, 25.884653073941166]
                ]
              ]
            ],
            type: 'MultiPolygon'
          },
          isGeometryComputedFromControls: true,
          isUnderJdp: true,
          missionSource: 'MONITORFISH',
          missionTypes: ['LAND']
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
    cy.wait(250)
    cy.fill('Port de contrôle', undefined)
    cy.get('*[data-cy="mission-main-form-location"]').should(
      'not.contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )
  })
})
