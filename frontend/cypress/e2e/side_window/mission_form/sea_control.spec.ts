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
    cy.fill('Nom du navire', "Un navire")
    cy.fill('Nationalité', "France")
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
          externalReferenceNumber: '',
          flagState: 'FR',
          internalReferenceNumber: '',
          ircs: '',
          vesselId: -1,
          vesselName: 'Un navire'
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

    // Use the real species-control-prefill endpoint: for this vessel it injects the logbook discard
    // species NEP and BIB after the logbook FAR species (HKE, BLI). The onboard species are therefore
    // [HKE, BLI, NEP, BIB] before adding COD (which lands at index 4).
    cy.intercept('GET', '/bff/v1/vessels/logbook/species-control-prefill*').as('speciesPrefill')

    // -------------------------------------------------------------------------
    // Form

    cy.getDataCy('action-completion-status').contains('20 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')
    cy.getDataCy('mission-form-header').contains('À compléter')

    // Rechercher un navire...
    cy.get('input[placeholder="Rechercher un navire..."]').type('malot').wait(250)
    cy.contains('mark', 'MALOT').click()

    cy.wait(500)
    cy.wait('@speciesPrefill')

    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=TALK2ME' +
      '&internalReferenceNumber=U_W0NTFINDME&IRCS=QGDF&trackDepth=TWELVE_HOURS' +
      '&vesselId=2&vesselIdentifier=',
    ).as('showVessel')
    cy.get('a:contains("Voir la fiche")').click()
    cy.wait('@showVessel')

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // The "Lieu du contrôle" field is stubbed in FormikCoordinatesPicker

    // Obligations déclaratives et autorisations
    cy.fill('Bonne émission VMS', 'Oui')
    cy.fill('Bonne émission AIS', 'Non')
    cy.fill("Déclarations journal de pêche conformes à l’activité du navire", "N/A")
    cy.fill("Autorisations de pêche (AEP) conformes à l’activité du navire ", "Non")
    cy.fill("Contrôle de la puissance du moteur de propulsion", "Oui")
    cy.fill("Licence de pêche conformes à l’activité du navire", "Non")
    cy.fill("Plan d’arrimage présent et valide", "N/A")
    cy.fill("Autorisation pour la pesée à bord", "N/A")
    // The weighing certificate field should not be visible initially
    cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('not.exist')

    // Setting onboard weighing permit to Non should NOT show the cert field
    cy.fill('Autorisation pour la pesée à bord', 'Non')
    cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('not.exist')

    // Setting onboard weighing permit to Non concerné should NOT show the cert field
    cy.fill('Autorisation pour la pesée à bord', 'N/A')
    cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('not.exist')

    // Setting onboard weighing permit to Oui SHOULD show the cert field
    cy.fill('Autorisation pour la pesée à bord', 'Oui')
    cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('exist')

    // Changing back to Non should hide the cert field again
    cy.fill('Autorisation pour la pesée à bord', 'Non')
    cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('not.exist')
    cy.fill(
      "Observations (hors infractions) sur les obligations déclaratives / autorisations",
      "Une observation hors infraction sur les obligations déclaaratives."
    )

    // Engins à bord
    // OTB
    cy.fill('Engin contrôlé', 'Non')
    cy.fill("Marquage de l'engin conforme", 'Non')
    cy.fill('Maillage déclaré', 50)

    cy.fill('Ajouter un engin', 'MIS')
    cy.fill('Engin contrôlé', 'Oui', { index: 1 })
    cy.fill("Marquage de l'engin conforme", 'Oui', { index: 1 })
    cy.fill('Maillage déclaré', 10, { index: 1 })
    cy.fill('Maillage mesuré', 20, { index: 1 })
    cy.fill('MIS : autres mesures et dispositifs', 'Autres mesures.')

    // Espèces à bord
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')
    cy.fill("Arrimage séparé des poissons n'ayant pas la taille requise", 'Oui')
    cy.fill("Enregistrement séparé des poissons n'ayant pas la taille requise", 'Non')
    // FAO zones are required on every species for completion, including the prefilled discard species
    // NEP (index 2) and BIB (index 3) — otherwise the action stays "À compléter".
    cy.fill('Zone de pêche', ['27.8.b'], { index: 0 })
    cy.fill('Zone de pêche', ['27.8.b'], { index: 1 })
    cy.fill('Zone de pêche', ['27.8.b'], { index: 2 })
    cy.fill('Zone de pêche', ['27.8.b'], { index: 3 })
    cy.fill('Ajouter une espèce', 'COD')
    // COD is added after the 4 prefilled species [HKE, BLI, NEP, BIB], so it is species index 4.
    // The COD number inputs are filled via a re-querying `cy.get('[id="speciesOnboard[4]…"]').type()`
    // instead of `cy.fill()`: each edit fires an async `bff/v1/fleet_segments/compute` request whose
    // response re-renders and remounts the field; `cy.fill()` caches the field element and detaches
    // between its internal `.clear()` and `.type()`, whereas `cy.get()` re-queries the input fresh.
    // The fields are freshly added/opened (empty), so no `.clear()` is needed.
    // Label-based `{ index }` values differ per field: "Ajouter sous-taille", "Présentation du poisson"
    // and "Zone de pêche" render for every species (COD = index 4), whereas "Ajouter rejet" and
    // "Nature du rejet" only render for species without a prefilled rejet — NEP/BIB already show a
    // rejet input — so among HKE, BLI, COD, COD is index 2.
    cy.get('[id="speciesOnboard[4].declaredWeight"]').type('10', { force: true })
    cy.get('[id="speciesOnboard[4].controlledWeight"]').type('20', { force: true })
    cy.clickButton('Ajouter sous-taille', { index: 4 })
    cy.wait(200)
    cy.get('[id="speciesOnboard[4].underSizedWeight"]').type('5', { force: true })
    cy.clickButton('Ajouter rejet', { index: 2 })
    cy.wait(200)
    cy.get('[id="speciesOnboard[4].rejectedWeight"]').type('2', { force: true })
    cy.wait(250)
    cy.fill('Nature du rejet', 'RET - espèces protégées', { index: 2 })
    cy.fill('Présentation du poisson', 'FIL - En filets', { index: 4 })
    cy.fill('Zone de pêche', ['27.8.b'], { index: 4 })
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // This should trigger a computation of the fleet segment
    cy.intercept('POST', 'bff/v1/fleet_segments/compute').as(
      'computeFleetSegments'
    )
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)
    cy.wait('@computeFleetSegments')

    // Appréhension et déroutement
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
    cy.fill('Quantités saisies (kg)', 6289.5)
    cy.fill('Appréhension et déroutement du navire', true)

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
    cy.fill('Navire ciblé par le CNSP', 'Oui')
    cy.fill('Unité sans jauge oméga', true)
    cy.fill('Observations sur le déroulé du contrôle', 'Une observation sur le déroulé du contrôle.')
    cy.fill('Last haul effectué', 'Non')

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
          flagState: 'UNDEFINED',
          gearOnboard: [
            {
              comments: null,
              controlledMesh: null,
              declaredMesh: 50,
              gearCode: 'OTB',
              gearMarkingIsCompliant: 'NO',
              gearName: 'Chaluts de fond à panneaux',
              gearWasControlled: false,
              hasUncontrolledMesh: false
            },
            {
              comments: 'Autres mesures.',
              controlledMesh: 20,
              declaredMesh: 10,
              gearCode: 'MIS',
              gearMarkingIsCompliant: 'YES',
              gearName: 'Engin divers',
              gearWasControlled: true,
              hasUncontrolledMesh: false
            }
          ],
          hasSomeGearsSeized: true,
          hasSomeSpeciesSeized: true,
          id: 2,
          isINNControl: false,
          internalReferenceNumber: 'U_W0NTFINDME',
          ircs: 'QGDF',
          isLastHaul: false,
          latitude: 47.084,
          licencesAndLogbookObservations: 'Une observation hors infraction sur les obligations déclaaratives.',
          licencesMatchActivity: 'NO',
          infractions: [
            {
              comments: 'Une observation sur l’infraction déclarative.',
              infractionType: 'WITH_RECORD',
              threats: [{"children":[{"children":[{"label":"27717 - TRANSBORDEMENT HORS D'UN PORT DESIGNE DE PRODUITS DE LA PECHE MARITIME OU DE L'AQUACULTURE MARINE D'ESPECES SOUMISES A UN PLAN PLURIANNUEL","value":27717}],"label":"Transbordement","value":"Transbordement"}],"label":"Mesures techniques et de conservation","value":"Mesures techniques et de conservation"}]
            },
            {
              comments: 'Une observation sur l’infraction espèce.',
              infractionType: 'WITHOUT_RECORD',
              threats: [{"children":[{"children":[{"label":"4234 - NON PRESENTATION PAR UN CAPITAINE DE SON JOURNAL DE BORD AU VISA DES AGENTS DES DOUANES","value":4234}],"label":"Interférence","value":"Interférence"}],"label":"Entrave au contrôle","value":"Entrave au contrôle"}]
            },
            {
              comments: 'Une observation sur l’infraction autre.',
              infractionType: 'WITHOUT_RECORD',
              threats: [{"children":[{"children":[{"label":"2584 - OBSTACLE A UNE SAISIE EN MATIERE DE PECHE MARITIME","value":2584}],"label":"Interférence","value":"Interférence"}],"label":"Entrave au contrôle","value":"Entrave au contrôle"}]
            }
          ],
          logbookMatchesActivity: 'NOT_APPLICABLE',
          longitude: -3.872,
          missionId: 1,
          numberOfVesselsFlownOver: null,
          otherComments: 'Une autre observation.',
          portLocode: null,
          segments: [],
          seizureAndDiversion: true,
          seizureAndDiversionComments: null,
          separateStowageOfPreservedSpecies: 'YES',
          propulsionEnginePowerControl: 'YES',
          fishingLicencesMatchActivity: 'NO',
          stowagePlanPresent: 'NOT_APPLICABLE',
          onboardWeighingPermit: 'NO',
          weighingCertificateAndSystemsValid: null,
          underSizedSeparateStowage: 'YES',
          underSizedSeparateRecording: 'NO',
          speciesObservations: 'Une observation hors infraction sur les espèces.',
          speciesOnboard: [
            { controlledWeight: null, declaredWeight: 235.6, faoZones: ['27.8.b'], nbFish: null, speciesCode: 'HKE', underSized: false },
            { controlledWeight: null, declaredWeight: 13.46, faoZones: ['27.8.b'], nbFish: null, speciesCode: 'BLI', underSized: false },
            // NEP and BIB are injected by the real species-control-prefill endpoint (logbook discards).
            // We assert their presence/position here; their exact prefilled discard values are covered
            // by the dedicated "FAR and DIS logbook data" prefill test.
            { faoZones: ['27.8.b'], speciesCode: 'NEP', underSized: false },
            { discardReason: 'DIM', faoZones: ['27.8.b'], rejectedWeight: 3, speciesCode: 'BIB', underSized: false },
            { controlledWeight: 20, declaredWeight: 10, discardReason: 'RET', faoZones: ['27.8.b'], nbFish: null, presentationCode: 'FIL', rejectedWeight: 2, speciesCode: 'COD', underSized: false, underSizedWeight: 5 }
          ],
          speciesQuantitySeized: 6289.5,
          speciesSizeControlled: 'NO',
          speciesWeightControlled: 'YES',
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

    cy.intercept('GET', '/bff/v1/vessels/logbook/species-control-prefill*', { body: [], statusCode: 200 })

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
          flagState: 'FR',
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
          logbookMatchesActivity: null,
          longitude: -3.872,
          missionId: 1,
          numberOfVesselsFlownOver: null,
          otherComments: null,
          portLocode: null,
          segments: [{ segment: 'SWW02', segmentName: 'SWW02' }],
          seizureAndDiversion: false,
          seizureAndDiversionComments: null,
          separateStowageOfPreservedSpecies: null,
          propulsionEnginePowerControl: null,
          fishingLicencesMatchActivity: null,
          stowagePlanPresent: null,
          onboardWeighingPermit: null,
          weighingCertificateAndSystemsValid: null,
          underSizedSeparateStowage: null,
          underSizedSeparateRecording: null,
          infractions: [],
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

    cy.fill('Type d’infraction et NATINF', ['27717'])

    // -------------------------------------------------------------------------
    // Add

    cy.fill('Observations sur l’infraction', "Une observation sur l'infraction")

    cy.clickButton('Valider l’infraction')

    cy.contains('Infraction - Mesures techniques et de conservation').should('exist')
    cy.contains('Avec PV').should('exist')
    cy.contains('Transbordement / NATINF 27717').should('exist')

    cy.contains("Une observation sur l'infraction").should('exist')

    // -------------------------------------------------------------------------
    // Edit

    cy.clickButton("Éditer l'infraction")

    cy.fill('Résultat de l’infraction', 'Sans PV')
    cy.fill('Type d’infraction et NATINF', ['2584'])
    cy.fill('Observations sur l’infraction', "Une autre observation sur l'infraction")

    cy.clickButton('Valider l’infraction')

    cy.contains('Infraction - Entrave au contrôle').should('exist')
    cy.contains('Sans PV').should('exist')
    cy.contains('Interférence / NATINF 2584').should('exist')
    cy.contains("Une autre observation sur l'infraction").should('exist')

    // -------------------------------------------------------------------------
    // Remove

    cy.clickButton("Supprimer l'infraction")

    cy.contains('Infraction 1').should('not.exist')
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
    cy.get('.Component-Banner').contains(
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
    cy.get('.Component-Banner').contains(
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
                  [-3.872, 47.101986407274495],
                  [-3.869410041080584, 47.101899768622985],
                  [-3.866845049962035, 47.101640687887254],
                  [-3.8643297530265146, 47.10121166264767],
                  [-3.8618883961809822, 47.1006168286971],
                  [-3.859544510500879, 47.0998619200555],
                  [-3.857320684863955, 47.09895421353846],
                  [-3.8552383477927026, 47.09790245842231],
                  [-3.8533175606300376, 47.096716791892845],
                  [-3.8515768240575623, 47.09540864110258],
                  [-3.850032899830469, 47.093990612792936],
                  [-3.8487006494493987, 47.09247637155622],
                  [-3.847592891319127, 47.090880507922634],
                  [-3.846720277758732, 47.0892183975551],
                  [-3.8460911930299737, 47.087506052918684],
                  [-3.845711673342138, 47.08575996886319],
                  [-3.8455853495748493, 47.08399696361391],
                  [-3.8457134132375046, 47.08223401670793],
                  [-3.846094605957535, 47.08048810544017],
                  [-3.846725232561656, 47.07877604139591],
                  [-3.8475991975871917, 47.07711430864194],
                  [-3.8487080648363405, 47.07551890513173],
                  [-3.850041139367206, 47.07400518884603],
                  [-3.8515855711033744, 47.072587730141464],
                  [-3.853326479040891, 47.0712801717207],
                  [-3.8552470948390716, 47.07009509756074],
                  [-3.8573289244017195, 47.06904391204981],
                  [-3.8595519258891673, 47.0681367304839],
                  [-3.861894702450503, 47.06738228196582],
                  [-3.8643347078307837, 47.06678782562892],
                  [-3.8668484628906272, 47.066359080981556],
                  [-3.869411780976508, 47.0661001730337],
                  [-3.872, 47.06601359272551],
                  [-3.874588219023491, 47.0661001730337],
                  [-3.877151537109373, 47.066359080981556],
                  [-3.879665292169215, 47.06678782562892],
                  [-3.882105297549497, 47.06738228196582],
                  [-3.884448074110832, 47.0681367304839],
                  [-3.8866710755982794, 47.06904391204981],
                  [-3.8887529051609286, 47.07009509756074],
                  [-3.890673520959108, 47.0712801717207],
                  [-3.8924144288966245, 47.072587730141464],
                  [-3.8939588606327944, 47.07400518884603],
                  [-3.8952919351636592, 47.07551890513173],
                  [-3.896400802412808, 47.07711430864194],
                  [-3.8972747674383434, 47.07877604139591],
                  [-3.8979053940424637, 47.08048810544017],
                  [-3.8982865867624943, 47.08223401670793],
                  [-3.8984146504251505, 47.08399696361391],
                  [-3.898288326657862, 47.08575996886319],
                  [-3.8979088069700265, 47.087506052918684],
                  [-3.897279722241267, 47.0892183975551],
                  [-3.896407108680872, 47.090880507922634],
                  [-3.8952993505506006, 47.09247637155622],
                  [-3.893967100169531, 47.093990612792936],
                  [-3.8924231759424366, 47.09540864110258],
                  [-3.890682439369962, 47.096716791892845],
                  [-3.888761652207297, 47.09790245842231],
                  [-3.886679315136045, 47.09895421353846],
                  [-3.88445548949912, 47.0998619200555],
                  [-3.882111603819018, 47.1006168286971],
                  [-3.8796702469734843, 47.10121166264767],
                  [-3.8771549500379647, 47.101640687887254],
                  [-3.874589958919415, 47.101899768622985],
                  [-3.872, 47.101986407274495]
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


  it('Should display the expected vessel details', () => {
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('GET', '/bff/v1/vessels/2').as('getVessel')

    // -------------------------------------------------------------------------
    // Form

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)

    cy.wait(500)

    cy.wait('@getVessel').then(() => {
      cy.contains('U_W0NTFINDME (CFR)').should('exist')
      cy.contains('TALK2ME (Mq. ext)').should('exist')
      cy.contains('QGDF (Call Sign)').should('exist')
      cy.contains('12.89m (Taille)').should('exist')
    })
  })

  it('Should show wire fields only for Lignes et hameçons gears and send the expected data to the API', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)

    cy.wait(500)

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: { id: 2 },
      statusCode: 201
    }).as('postMissionAction')

    cy.wait(500)

    cy.get('[id="gearOnboard[0].averageWireThickness"]').should('not.exist')
    cy.get('[name="gearOnboard[0].wireType"]').should('not.exist')

    cy.fill('Engin contrôlé', 'Non', { index: 0 })
    cy.fill("Marquage de l'engin conforme", 'Non', { index: 0 })
    cy.fill('Maillage déclaré', 60, { index: 0 })

    // Add an LLS gear (Lignes et hameçons category) — wire fields should appear
    cy.fill('Ajouter un engin', 'LLS')
    cy.wait(250)
    cy.get('[id="gearOnboard[1].averageWireThickness"]').should('exist')
    cy.get('[name="gearOnboard[1].wireType"]').should('exist')

    cy.fill('Engin contrôlé', 'Oui', { index: 1 })
    cy.fill("Marquage de l'engin conforme", 'Oui', { index: 1 })
    cy.fill('Epaisseur moyenne de fil', 1.5)
    cy.fill('Type de fil', 'Simple')


    cy.fill('Saisi par', 'Marlin')

    cy.waitForLastRequest(
      '@postMissionAction',
      {
        body: {
          gearOnboard: [
            {
              averageWireThickness: 1.5,
              gearCode: 'LLS',
              gearMarkingIsCompliant: 'YES',
              gearWasControlled: true,
              wireType: 'SINGLE'
            },
            {
              averageWireThickness: null,
              gearCode: 'OTB',
              gearMarkingIsCompliant: 'NO',
              gearWasControlled: false,
              wireType: null
            }
          ]
        }
      },
      5
    )
  })

  it(
    'Should not display e-ISR-specific fields when e-ISR feature flag is disabled',
    { env: { FRONTEND_E_ISR_ENABLED: false } },
    () => {
      fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

      cy.clickButton('Ajouter')
      cy.clickButton('Ajouter un contrôle en mer')

      // Gangway field
      cy.contains('Echelle de coupée').should('not.exist')

      // "Obligations déclaratives et autorisations de pêche" e-ISR fields
      cy.contains('Contrôle de la puissance du moteur de propulsion').should('not.exist')
      cy.contains("Licence de pêche conformes à l’activité du navire").should('not.exist')
      cy.contains("Plan d’arrimage présent et valide").should('not.exist')
      cy.contains('Autorisation pour la pesée à bord').should('not.exist')
      cy.contains('Certificat de pesée présent et systèmes de pesée à bord valides').should('not.exist')

      // "Espèces à bord" e-ISR fields
      cy.contains("Arrimage séparé des poissons n'ayant pas la taille requise").should('not.exist')
      cy.contains("Enregistrement séparé des poissons n'ayant pas la taille requise").should('not.exist')
    }
  )

  it('Should prefill speciesOnboard with FAR and DIS logbook data (faoZones, presentationCode, rejectedWeight, discardReason)', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    cy.intercept('POST', '/bff/v1/mission_actions', { body: { id: 2 }, statusCode: 201 }).as('postMissionAction3')

    cy.intercept('GET', '/bff/v1/vessels/logbook/species-control-prefill*', {
      body: [
        {
          discardReason: 'DIS',
          faoZones: ['27.8.a', '27.8.b'],
          presentationCode: 'GUT',
          rejectedWeight: 50.0,
          speciesCode: 'HKE'
        },
        {
          discardReason: 'DIM',
          faoZones: ['27.8.c'],
          presentationCode: 'WHL',
          rejectedWeight: 5.0,
          speciesCode: 'BLI'
        }
      ],
      statusCode: 200
    })

    // -------------------------------------------------------------------------
    // Select vessel

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Verify pre-filled values visible in the form

    // HKE species row: rejected weight should be visible (replaces the "Ajouter rejet" button)
    cy.contains('Qté rejetée').should('exist')
    cy.contains('Nature du rejet').should('exist')

    // Verify the request body includes all new pre-filled fields
    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)

    cy.waitForLastRequest(
      '@postMissionAction3',
      {
        body: {
          speciesOnboard: [
            {
              declaredWeight: 471.2,
              discardReason: 'DIS',
              faoZones: ['27.8.a', '27.8.b'],
              presentationCode: 'GUT',
              rejectedWeight: 50.0,
              speciesCode: 'HKE'
            },
            {
              declaredWeight: 13.46,
              discardReason: 'DIM',
              faoZones: ['27.8.c'],
              presentationCode: 'WHL',
              rejectedWeight: 5.0,
              speciesCode: 'BLI'
            }
          ]
        }
      },
      10
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should dismiss sous-taille and rejet fields and restore add-buttons when delete buttons are clicked', () => {
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')
    cy.fill('Ajouter une espèce', 'COD')

    // Show under-sized field, fill it, then dismiss it
    cy.clickButton('Ajouter sous-taille')
    cy.fill('Qté sous-taille', 5)
    cy.clickButton('Retirer la sous-taille')
    cy.contains('Qté sous-taille').should('not.exist')
    cy.contains('Ajouter sous-taille').should('be.visible')

    // Show rejected field, fill it, then dismiss it
    cy.clickButton('Ajouter rejet')
    cy.fill('Qté rejetée', 2)
    cy.fill('Nature du rejet', 'RET - espèces protégées')
    cy.clickButton('Retirer le rejet')
    cy.contains('Qté rejetée').should('not.exist')
    cy.contains('Nature du rejet').should('not.exist')
    cy.contains('Ajouter rejet').should('be.visible')
  })
})
