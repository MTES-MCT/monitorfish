import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission, pickHoverEditSpecies } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Land Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.LAND)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle à la débarque')
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.getDataCy('action-completion-status').contains('19 champs nécessaires aux statistiques à compléter')
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

    cy.intercept('GET', '/bff/v1/vessels/logbook/species-control-prefill*').as('speciesPrefill')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno').wait(250)
    cy.contains('mark', 'PHENO').click()
    cy.wait('@speciesPrefill')
    cy.wait(500)

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // Port de contrôle
    // Try to select a port with custom search (the "-" missing but the port should be found)
    cy.get('input[name="port"]').click({ force: true })
    cy.get('input[placeholder="Rechercher"]').type('saintmalo{enter}', { force: true })
    // Should select the right port
    cy.get('.Field-Select').contains('Saint-Malo (FRSML)')

    // Get the actual port for this test case
    cy.fill('Port de contrôle', 'Auray')

    // The propulsion power check is not displayed on land controls (forced to N/A); VMS / AIS are controlled.
    cy.fill('Bonne émission VMS', 'Oui')
    cy.fill('Bonne émission AIS', 'Non')
    cy.fill('Accès au port / autorisation de débarquement conformes', 'Non')
    cy.fill('Journal de pêche ouvert avant le contrôle', 'Oui')
    cy.fill('Déclarations journal de pêche conformes à l’activité du navire', 'N/A')
    cy.fill('Autorisations de pêche (AEP, ANP, licences locales) conformes à l’activité du navire ', 'Non')
    cy.fill('Licence de pêche européenne valide', 'Non')
    cy.fill('Plan d’arrimage présent et conforme', 'N/A')
    // The N/A radio of the onboard weighing permit is disabled.
    cy.fill('Autorisation pour la pesée à bord', 'Non')
    cy.fill(
      'Observations (hors infractions) sur les obligations déclaratives / autorisations',
      'Une observation hors infraction sur les obligations déclaaratives.'
    )

    // Engins à bord
    cy.fill('Ajouter un engin', 'MIS')
    cy.fill('Engin contrôlé', 'Oui')
    cy.fill("Marquage de l'engin conforme", 'Oui')
    cy.get('[name="gearOnboard[1].gearWasControlled"]').eq(1).click()
    cy.fill("Marquage de l'engin conforme", 'Non', { index: 1 })

    // Inspection des espèces — HKE/NEP/BLI are prefilled catches; add COD as a 4th (row 3). Adding is the
    // in-table flow: click the "Ajouter une espèce" row, then pick the species in the new row's Select.
    cy.clickButton('Ajouter une espèce')
    pickHoverEditSpecies('species-onboard-row-3', 'COD')
    // The "Pour les espèces non débarquées" section only appears below the species table once a
    // species is marked as not landed (see the HKE toggle below).
    cy.contains("Enregistrement séparé des poissons n'ayant pas la taille requise").should('not.exist')
    // Pour les espèces débarquées
    cy.fill('Taille des espèces vérifiées', 'Oui')
    // The weight-related checks are hidden (forced to N/A) pending clarification of the topic.
    cy.contains('Poids des espèces vérifiés').should('not.exist')
    cy.contains('Type de contrôle du poids').should('not.exist')
    cy.contains("Informations sur l'opérateur de pesée agréé").should('not.exist')
    cy.fill('Cale contrôlée après déchargement', 'Oui')
    cy.fill('Suivi des opérations de pesée par les inspecteurs', 'Non')
    // Catch rows (HKE 0, NEP 1, BLI 2, COD 3) only render their editors on row hover; non-hovered rows
    // show plain text. Hover a row, then wait for its editors to actually mount (`.Field-CheckPicker`
    // should('exist')) before filling: row activation is debounced (hover-intent delay), so without this
    // wait `cy.fill` runs before the row activates and fills whichever row is still active. Weight inputs
    // are queried by id (not `cy.fill`) because each edit fires an async fleet-segment recompute that
    // remounts the field and detaches a cached `cy.fill` element. Présentation/Zone are filled by label
    // while only the hovered row's editor is mounted, so no index is needed.
    cy.get('[data-cy="species-onboard-row-0"]').trigger('mouseover', { force: true })
    cy.get('[data-cy="species-onboard-row-0"]').find('.Field-CheckPicker').should('exist')
    // HKE is a landed catch, so its controlled-weight field is labelled "Pesée". Fill it, then mark the
    // species as not landed via the "Espèce débarquée" toggle (the weight value is kept).
    cy.fill('Pesée', '500')
    cy.clickButton('Espèce débarquée')
    cy.get('[id="speciesOnboard[0].underSizedWeight"]').type('10', { force: true })
    cy.fill('Présentation', ['WHL - Entier'])
    cy.fill('Zone de pêche', ['27.8.b'])
    cy.get('[data-cy="species-onboard-row-0"]').trigger('mouseout', { force: true })

    cy.get('[data-cy="species-onboard-row-1"]').trigger('mouseover', { force: true })
    cy.get('[data-cy="species-onboard-row-1"]').find('.Field-CheckPicker').should('exist')
    cy.fill('Zone de pêche', ['27.8.b'])
    cy.get('[data-cy="species-onboard-row-1"]').trigger('mouseout', { force: true })

    cy.get('[data-cy="species-onboard-row-2"]').trigger('mouseover', { force: true })
    cy.get('[data-cy="species-onboard-row-2"]').find('.Field-CheckPicker').should('exist')
    cy.fill('Zone de pêche', ['27.8.b'])
    cy.get('[data-cy="species-onboard-row-2"]').trigger('mouseout', { force: true })

    cy.get('[data-cy="species-onboard-row-3"]').trigger('mouseover', { force: true })
    cy.get('[data-cy="species-onboard-row-3"]').find('.Field-CheckPicker').should('exist')
    cy.fill('Zone de pêche', ['27.8.b'])
    // Stop hovering so the catch-row editors collapse.
    // React derives `onMouseLeave` from the native `mouseout` event, so trigger `mouseout` (not `mouseleave`).
    cy.get('[data-cy="species-onboard-row-3"]').trigger('mouseout', { force: true })

    // Pour les espèces non débarquées — the section is now visible since HKE was marked as not landed.
    cy.fill("Enregistrement séparé des poissons n'ayant pas la taille requise", 'Non')

    // The land control form has no "Rejets" card: discards are not edited here. The NEP/BIB logbook
    // discards remain prefilled in the form state and are submitted as-is (see the payload assertion).
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhensions
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
    cy.fill('Quantités saisies (kg)', 6289.5)
    cy.fill('Appréhension du navire', true)

    // Infractions
    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Avec PV')
    cy.fill('Type d’infraction et NATINF', ['27717'])
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction déclarative.')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Type d’infraction et NATINF', ['4234'])
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction espèce.')
    cy.clickButton('Valider l’infraction')

    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Type d’infraction et NATINF', ['2584'])
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction autre.')
    cy.clickButton('Valider l’infraction')

    // Autres observations
    cy.fill('Autres observations', 'Une autre observation.')

    // Qualité du contrôle
    cy.fill('Unité sans jauge oméga', true)
    cy.fill('Observations sur le déroulé du contrôle', 'Une observation sur le déroulé du contrôle.')
    cy.fill('Last haul effectué', 'Oui')

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
          approvedWeighingOperatorInformation: 'NOT_APPLICABLE',
          completedBy: 'Alice',
          completion: 'COMPLETED',
          controlQualityComments: 'Une observation sur le déroulé du contrôle.',
          controlUnits: [],
          // NEP and BIB are prefilled from the logbook DIS (both DIM at 27.8.a). The land control form has
          // no "Rejets" card, so these prefilled discards are submitted as-is and no discard is added here.
          discardedSpecies: [
            { discardReason: 'DIM', faoZones: ['27.8.a'], rejectedWeight: 5, speciesCode: 'NEP' },
            { discardReason: 'DIM', faoZones: ['27.8.a'], rejectedWeight: 3, speciesCode: 'BIB' }
          ],

          districtCode: 'AY',

          emitsAis: 'NO',

          emitsVms: 'YES',

          europeanFishingLicenceValid: 'NO',

          externalReferenceNumber: 'DONTSINK',

          facade: null,

          faoAreas: ['27.8.b', '27.8.c'],

          flagState: 'FR',

          gearOnboard: [
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: 70,
              gearCode: 'OTB',
              gearMarkingIsCompliant: 'YES',
              gearName: 'Chaluts de fond à panneaux',
              gearWasControlled: true,
              hasUncontrolledMesh: false
            },
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: null,
              gearCode: 'MIS',
              gearMarkingIsCompliant: 'NO',
              gearName: 'Engin divers',
              gearWasControlled: false,
              hasUncontrolledMesh: false
            }
          ],

          hasSomeGearsSeized: true,

          hasSomeSpeciesSeized: true,

          holdControlledAfterUnloading: 'YES',

          id: 2,

          infractions: [
            {
              comments: 'Une observation sur l’infraction déclarative.',
              infractionType: 'WITH_RECORD',
              threats: [
                {
                  children: [
                    {
                      children: [
                        {
                          label:
                            "27717 - TRANSBORDEMENT HORS D'UN PORT DESIGNE DE PRODUITS DE LA PECHE MARITIME OU DE L'AQUACULTURE MARINE D'ESPECES SOUMISES A UN PLAN PLURIANNUEL",
                          value: 27717
                        }
                      ],
                      label: 'Transbordement',
                      value: 'Transbordement'
                    }
                  ],
                  label: 'Mesures techniques et de conservation',
                  value: 'Mesures techniques et de conservation'
                }
              ]
            },
            {
              comments: 'Une observation sur l’infraction espèce.',
              infractionType: 'WITHOUT_RECORD',
              threats: [
                {
                  children: [
                    {
                      children: [
                        {
                          label:
                            '4234 - NON PRESENTATION PAR UN CAPITAINE DE SON JOURNAL DE BORD AU VISA DES AGENTS DES DOUANES',
                          value: 4234
                        }
                      ],
                      label: 'Interférence',
                      value: 'Interférence'
                    }
                  ],
                  label: 'Entrave au contrôle',
                  value: 'Entrave au contrôle'
                }
              ]
            },
            {
              comments: 'Une observation sur l’infraction autre.',
              infractionType: 'WITHOUT_RECORD',
              threats: [
                {
                  children: [
                    {
                      children: [{ label: '2584 - OBSTACLE A UNE SAISIE EN MATIERE DE PECHE MARITIME', value: 2584 }],
                      label: 'Interférence',
                      value: 'Interférence'
                    }
                  ],
                  label: 'Entrave au contrôle',
                  value: 'Entrave au contrôle'
                }
              ]
            }
          ],

          internalReferenceNumber: 'FAK000999999',

          ircs: 'CALLME',

          isLastHaul: true,

          latitude: null,

          licencesAndLogbookObservations: 'Une observation hors infraction sur les obligations déclaaratives.',

          licencesMatchActivity: 'NO',

          logbookMatchesActivity: 'NOT_APPLICABLE',

          longitude: null,

          missionId: 1,

          numberOfVesselsFlownOver: null,

          onboardWeighingPermit: 'NO',

          otherComments: 'Une autre observation.',

          portEntranceAndLandingAuthorized: 'NO',

          portLocode: 'FRZEG',

          propulsionEnginePowerControl: 'NOT_APPLICABLE',

          segments: [{ segment: 'SWW02', segmentName: 'SWW02' }],

          seizureAndDiversion: true,

          seizureAndDiversionComments: null,

          speciesObservations: 'Une observation hors infraction sur les espèces.',

          // Catches are the risk factor species sorted by weight: HKE (471.2), NEP (235.6), BLI (13.46),
          // then the manually added COD. HKE keeps isNotLanded / underSizedWeight / presentationCodes as a
          // landed catch.
          speciesOnboard: [
            {
              controlledWeight: 500,
              declaredWeight: 471.2,
              faoZones: ['27.8.b'],
              isNotLanded: true,
              nbFish: null,
              presentationCodes: ['WHL'],
              speciesCode: 'HKE',
              underSized: false,
              underSizedWeight: 10
            },
            {
              controlledWeight: null,
              declaredWeight: 235.6,
              faoZones: ['27.8.b'],
              nbFish: null,
              speciesCode: 'NEP',
              underSized: false
            },
            {
              controlledWeight: null,
              declaredWeight: 13.46,
              faoZones: ['27.8.b'],
              nbFish: null,
              speciesCode: 'BLI',
              underSized: false
            },
            { controlledWeight: null, declaredWeight: null, nbFish: null, speciesCode: 'COD', underSized: false }
          ],

          speciesQuantitySeized: 6289.5,

          speciesSizeControlled: 'YES',

          speciesWeightControlled: 'NOT_APPLICABLE',

          stowagePlanPresent: 'NOT_APPLICABLE',

          underSizedSeparateRecording: 'NO',
          unitWithoutOmegaGauge: true,
          userTrigram: 'Marlin',
          vesselId: 1,
          vesselName: 'PHENOMENE',
          vesselTargeted: 'YES',
          weighingOperationsMonitoredByInspectors: 'NO',
          weightControlMethod: 'NOT_APPLICABLE'
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
    cy.get('.Component-Banner').contains('Une zone de mission a été modifiée à partir des contrôles de la mission')
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
    cy.get('.Component-Banner').contains('Une zone de mission a été modifiée à partir des contrôles de la mission')

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
