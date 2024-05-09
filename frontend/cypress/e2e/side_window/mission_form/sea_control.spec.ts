import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Sea Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()
  })

  it('Should fill the form with an unknown vessel and send the expected data to the API', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA, false)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

    cy.fill('Navire inconnu', true)
    cy.fill('Ajouter un engin', 'MIS')
    // The "Lieu du contrôle" field is stubbed in FormikCoordinatesPicker

    cy.wait(500)

    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          externalReferenceNumber: 'UNKNOWN',
          flagState: 'UNKNOWN',
          internalReferenceNumber: 'UNKNOWN',
          ircs: 'UNKNOWN',
          vesselId: -1,
          vesselName: 'UNKNOWN'
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should fill the form and send the expected data to the API', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.getDataCy('mission-form-header').contains('À jour')

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    const now = getUtcDateInMultipleFormats()
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    })
    cy.intercept('PUT', '/bff/v1/mission_actions/2', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form

    cy.getDataCy('action-completion-status').contains('12 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')
    cy.getDataCy('mission-form-header').contains('À compléter')

    // Rechercher un navire...
    cy.get('input[placeholder="Rechercher un navire..."]').type('malot').wait(250)
    cy.contains('mark', 'MALOT').click()

    cy.wait(500)

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // The "Lieu du contrôle" field is stubbed in FormikCoordinatesPicker

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
    cy.fill('Maillage déclaré', 10)
    cy.fill('Maillage mesuré', 20)
    // This will modify the "Maillage mesuré" input as `undefined`
    cy.fill('Maillage non mesuré', true)
    cy.fill('MIS : autres mesures et dispositifs', 'Autres mesures.')

    cy.fill('Ajouter un engin', 'OTB')
    cy.get('[name="gearOnboard[1].gearWasControlled"]').eq(1).click()

    // Espèces à bord
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')
    cy.fill('Ajouter une espèce', 'COD')
    cy.fill('Qté déclarée', 10)
    cy.fill('Qté estimée', 20)
    cy.fill('Sous-taille', true)
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhension et déroutement
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
    cy.fill('Appréhension et déroutement du navire', true)

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
          actionType: 'SEA_CONTROL',
          completedBy: 'Alice',
          completion: 'COMPLETED',
          controlQualityComments: 'Une observation sur le déroulé du contrôle.',
          controlUnits: [],
          districtCode: 'AY',
          emitsAis: 'NO',
          emitsVms: 'YES',
          externalReferenceNumber: 'TALK2ME',
          facade: null,
          feedbackSheetRequired: true,
          flagState: 'UNDEFINED',
          gearInfractions: [],
          gearOnboard: [
            {
              comments: 'Autres mesures.',
              // controlledMesh: undefined,
              declaredMesh: 10,
              gearCode: 'MIS',
              gearName: 'Engin divers',
              gearWasControlled: true,
              hasUncontrolledMesh: true
            },
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: null,
              gearCode: 'OTB',
              gearName: 'Chaluts de fond à panneaux',
              gearWasControlled: false,
              hasUncontrolledMesh: false
            }
          ],
          hasSomeGearsSeized: true,
          hasSomeSpeciesSeized: true,
          id: 2,
          internalReferenceNumber: 'U_W0NTFINDME',
          ircs: 'QGDF',
          latitude: 47.084,
          licencesAndLogbookObservations: 'Une observation hors infraction sur les obligations déclaaratives.',
          licencesMatchActivity: 'NO',
          logbookInfractions: [
            { comments: 'Une observation sur l’infraction déclarative.', infractionType: 'WITH_RECORD', natinf: 23581 }
          ],
          logbookMatchesActivity: 'NOT_APPLICABLE',
          longitude: -3.872,
          missionId: 1,
          numberOfVesselsFlownOver: null,
          otherComments: 'Une autre observation.',
          otherInfractions: [
            { comments: 'Une observation sur l’infraction autre.', infractionType: 'WITHOUT_RECORD', natinf: 27689 }
          ],
          portLocode: null,
          segments: [],
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
            { controlledWeight: 20, declaredWeight: 10, nbFish: null, speciesCode: 'COD', underSized: true }
          ],
          speciesSizeControlled: false,
          speciesWeightControlled: true,
          unitWithoutOmegaGauge: true,
          userTrigram: 'Marlin',
          vesselId: 2,
          vesselName: 'MALOTRU',
          vesselTargeted: 'YES'
        }
      },
      10
    )
      .its('response.statusCode')
      .should('eq', 201)

    cy.getDataCy('action-completion-status').contains('Les champs nécessaires aux statistiques sont complétés.')
    cy.getDataCy('action-all-fields-completed').should('exist')

    /*
      TODO add these remaining tests :
      assert.include(interception.request.body.actionDatetimeUtc, now.utcDateAsShortString)
      assert.isUndefined(interception.request.body.gearOnboard[0].controlledMesh)
     */
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    })
    cy.intercept('PUT', '/bff/v1/mission_actions/2', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    // Saisi par
    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)

    /// Complété par
    cy.fill('Complété par', 'Alice', { index: 1 })

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
          actionType: 'SEA_CONTROL',
          completedBy: 'Alice',
          controlQualityComments: null,
          controlUnits: [],
          districtCode: 'AY',
          emitsAis: null,
          emitsVms: null,
          externalReferenceNumber: 'DONTSINK',
          facade: null,
          faoAreas: ['27.8.b', '27.8.c'],
          feedbackSheetRequired: false,
          flagState: 'FR',
          gearInfractions: [],
          gearOnboard: [
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: 70,
              gearCode: 'OTB',
              gearName: 'Chaluts de fond à panneaux',
              gearWasControlled: null,
              hasUncontrolledMesh: false
            }
          ],
          hasSomeGearsSeized: false,
          hasSomeSpeciesSeized: false,
          id: 2,
          internalReferenceNumber: 'FAK000999999',
          ircs: 'CALLME',
          latitude: 47.084,
          licencesAndLogbookObservations: null,
          licencesMatchActivity: null,
          logbookInfractions: [],
          logbookMatchesActivity: null,
          longitude: -3.872,
          missionId: 1,
          numberOfVesselsFlownOver: null,
          otherComments: null,
          otherInfractions: [],
          portLocode: null,
          segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
          seizureAndDiversion: false,
          seizureAndDiversionComments: null,
          separateStowageOfPreservedSpecies: null,
          speciesInfractions: [],
          speciesObservations: null,
          speciesOnboard: [
            { controlledWeight: null, declaredWeight: 471.2, nbFish: null, speciesCode: 'HKE', underSized: false },
            { controlledWeight: null, declaredWeight: 13.46, nbFish: null, speciesCode: 'BLI', underSized: false }
          ],
          speciesSizeControlled: null,
          speciesWeightControlled: null,
          unitWithoutOmegaGauge: false,
          userTrigram: 'Gaumont',
          vesselId: 1,
          vesselName: 'PHENOMENE',
          vesselTargeted: null
        }
      },
      10
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should add, edit, remove and validate gears infractions as expected', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    // -------------------------------------------------------------------------
    // Form Validation

    cy.clickButton('Ajouter une infraction').wait(500)
    // This validation only run after the first submission attempt
    cy.clickButton('Valider l’infraction')

    cy.fill('Résultat de l’infraction', 'En attente')

    cy.fill('Résultat de l’infraction', 'Sans PV')

    cy.fill('Résultat de l’infraction', 'Avec PV')

    cy.fill('Catégorie d’infraction', 'Infraction engins')

    cy.fill('NATINF', '23581')

    // -------------------------------------------------------------------------
    // Add

    cy.fill('Observations sur l’infraction', "Une observation sur l'infraction")

    cy.clickButton('Valider l’infraction')

    cy.contains('Infraction engins 1').should('exist')
    cy.contains('Avec PV').should('exist')
    cy.contains('NATINF : 23581 - Taille de maille non réglementaire').should('exist')

    cy.contains("Une observation sur l'infraction").should('exist')

    // -------------------------------------------------------------------------
    // Edit

    cy.clickButton("Éditer l'infraction")

    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('NATINF', '23588')
    cy.fill('Observations sur l’infraction', "Une autre observation sur l'infraction")

    cy.clickButton('Valider l’infraction')

    cy.contains('Infraction engins 1').should('exist')
    cy.contains('Sans PV').should('exist')
    cy.contains('NATINF : 23588 - Chalutage dans la zone des 3 milles').should('exist')
    cy.contains("Une autre observation sur l'infraction").should('exist')

    // -------------------------------------------------------------------------
    // Remove

    cy.clickButton("Supprimer l'infraction")

    cy.contains('Infraction engins 1').should('not.exist')
  })

  it('Should fill the mission zone from the last sea control added', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

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

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Form

    cy.wait(250)

    // A mission zone should be automatically added (because of the stubbed coordinates update when IS_CYPRESS LocalSorage key is "true")
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été modifiée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno').wait(250)
    cy.contains('mark', 'PHENO').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // We need to wait so the success toast will be hidden
    cy.wait(250)

    // Add another sea control
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    // The mission zone should be automatically updated (because of the stubbed coordinates update when IS_CYPRESS LocalSorage key is "true")
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été modifiée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should(
      'contain',
      'Actuellement, la zone de mission ' +
        'est automatiquement calculée selon le point ou la zone de la dernière action rapportée par l’unité.'
    )

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('FR263418260').wait(250)
    cy.contains('mark', 'FR263418260').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

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
                  [-3.872, 47.11097961091173],
                  [-3.868114408455234, 47.11084963103204],
                  [-3.86426629374315, 47.11046094506423],
                  [-3.8604927695998605, 47.10981730187541],
                  [-3.856830227149108, 47.10892490920904],
                  [-3.853313982510191, 47.10779237355001],
                  [-3.8499779349976735, 47.10643061676751],
                  [-3.846854239269598, 47.10485277035653],
                  [-3.843972994634829, 47.103074048318575],
                  [-3.8413619545510667, 47.10111159993147],
                  [-3.8390462591352756, 47.09898434385275],
                  [-3.8370481932703946, 47.09671278518431],
                  [-3.835386972629117, 47.094318817286876],
                  [-3.834078559650546, 47.09182551028121],
                  [-3.8331355112018297, 47.089256888298166],
                  [-3.8325668593381628, 47.08663769764388],
                  [-3.832378026244231, 47.08399316813154],
                  [-3.8325707741020354, 47.08134876989163],
                  [-3.8331431902875543, 47.078729968009725],
                  [-3.834089707955461, 47.07616197735885],
                  [-3.8354011617305064, 47.07366951998338],
                  [-3.8370648778894667, 47.07127658736334],
                  [-3.8390647980918637, 47.0690062098345],
                  [-3.8413816354037618, 47.06688023536708],
                  [-3.843993061059663, 47.06491911981129],
                  [-3.846873920125116, 47.063141730604855],
                  [-3.8499964739594743, 47.06156516580552],
                  [-3.8533306671360728, 47.060204590163124],
                  [-3.856844416257868, 47.059073089782174],
                  [-3.8605039179115876, 47.058181546746624],
                  [-3.8642739728340865, 47.05753853489051],
                  [-3.8681183232219283, 47.05715023769545],
                  [-3.872, 47.05702038908828],
                  [-3.875881676778072, 47.05715023769545],
                  [-3.8797260271659137, 47.05753853489051],
                  [-3.8834960820884126, 47.058181546746624],
                  [-3.887155583742131, 47.059073089782174],
                  [-3.890669332863927, 47.060204590163124],
                  [-3.894003526040525, 47.06156516580552],
                  [-3.897126079874883, 47.063141730604855],
                  [-3.9000069389403365, 47.06491911981129],
                  [-3.902618364596237, 47.06688023536708],
                  [-3.904935201908136, 47.0690062098345],
                  [-3.906935122110533, 47.07127658736334],
                  [-3.908598838269494, 47.07366951998338],
                  [-3.9099102920445388, 47.07616197735885],
                  [-3.9108568097124454, 47.078729968009725],
                  [-3.9114292258979644, 47.08134876989163],
                  [-3.911621973755768, 47.08399316813154],
                  [-3.911433140661836, 47.08663769764388],
                  [-3.91086448879817, 47.089256888298166],
                  [-3.909921440349454, 47.09182551028121],
                  [-3.908613027370882, 47.094318817286876],
                  [-3.9069518067296047, 47.09671278518431],
                  [-3.904953740864724, 47.09898434385275],
                  [-3.902638045448933, 47.10111159993147],
                  [-3.90002700536517, 47.103074048318575],
                  [-3.897145760730401, 47.10485277035653],
                  [-3.8940220650023263, 47.10643061676751],
                  [-3.890686017489808, 47.10779237355001],
                  [-3.8871697728508914, 47.10892490920904],
                  [-3.883507230400139, 47.10981730187541],
                  [-3.8797337062568498, 47.11046094506423],
                  [-3.875885591544765, 47.11084963103204],
                  [-3.872, 47.11097961091173]
                ]
              ]
            ],
            type: 'MultiPolygon'
          },
          isGeometryComputedFromControls: true,
          isUnderJdp: true,
          missionSource: 'MONITORFISH',
          missionTypes: ['SEA']
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should remove the other control fields When the previous PAM control unit is modified', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

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
    // Main Form

    // Add a PAM control unit
    cy.fill('Administration 1', undefined)
    cy.fill('Unité 1', 'PAM Jeanne Barret')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)
    cy.fill('Contrôle administratif', true)
    cy.fill('Respect du code de la navigation sur le plan d’eau', false)
    cy.fill('Gens de mer', true)
    cy.fill('Equipement de sécurité et respect des normes', false)

    cy.wait(500)

    cy.fill('Saisi par', 'Marlin')
    cy.wait(500)

    // Remove the PAM control unit
    cy.fill('Administration 1', undefined)
    cy.fill('Unité 1', 'Cultures marines 56')

    cy.get('legend')
      .filter(':contains("Autre(s) contrôle(s) effectué(s) par l’unité sur le navire")')
      .should('have.length', 0)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
          isAdministrativeControl: null,
          isComplianceWithWaterRegulationsControl: null,
          isSafetyEquipmentAndStandardsComplianceControl: null,
          isSeafarersControl: null
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should add a PAM control unit and send the other control fields', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Main Form

    cy.get('legend')
      .filter(':contains("Autre(s) contrôle(s) effectué(s) par l’unité sur le navire")')
      .should('have.length', 0)

    // Add a PAM control unit
    cy.fill('Administration 1', undefined)
    cy.fill('Unité 1', 'PAM Jeanne Barret')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)

    cy.get('legend')
      .filter(':contains("Autre(s) contrôle(s) effectué(s) par l’unité sur le navire")')
      .should('have.length', 1)
    cy.fill('Contrôle administratif', true)
    cy.fill('Respect du code de la navigation sur le plan d’eau', false)
    cy.fill('Gens de mer', true)
    cy.fill('Equipement de sécurité et respect des normes', false)

    cy.wait(500)

    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          isAdministrativeControl: true,
          isComplianceWithWaterRegulationsControl: false,
          isSafetyEquipmentAndStandardsComplianceControl: false,
          isSeafarersControl: true
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should update (PUT) a control right after creating a new control (and not create a new one with POST)', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionActionOne')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)

    cy.wait(500)

    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.wait('@createMissionActionOne').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      cy.wait(500)

      const newActionId = interception.response.body.id
      cy.intercept('PUT', `/bff/v1/mission_actions/${newActionId}`, {
        body: {
          id: 1
        },
        statusCode: 201
      }).as('updateMissionAction')

      cy.fill('Saisi par', 'Marlin CROSS')

      cy.wait('@updateMissionAction')
    })
  })
})
