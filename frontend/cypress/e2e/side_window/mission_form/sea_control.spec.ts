import { editSideWindowMission, fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'

context('Side Window > Mission Form > Sea Control', () => {
  it('Should fill the form for MALOTRU and send the expected data to the API', () => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    // -------------------------------------------------------------------------
    // Form

    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('malot')
    cy.contains('mark', 'MALOT').click()

    // Date et heure du contrôle
    // TODO Add this test.

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
    cy.fill('Engin contrôlé', 'Oui')
    cy.fill('Maillage déclaré', '10')
    cy.fill('Maillage mesuré', '20')
    cy.fill('MIS : autres mesures et dispositifs', 'Autres mesures.')

    // Espèces à bord
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')
    cy.fill('Ajouter une espèce', 'COD')
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

    // Qualité du contrôle
    cy.fill('Navire ciblé par le CNSP', 'Oui')
    cy.fill('Unité sans jauge oméga', true)
    cy.fill('Observations sur le déroulé du contrôle', 'Une observation sur le déroulé du contrôle.')
    cy.fill('Fiche RETEX nécessaire', true)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: 'Une observation sur le déroulé du contrôle.',
        controlUnits: [],
        diversion: null,
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
            controlledMesh: 20,
            declaredMesh: 10,
            gearCode: 'MIS',
            gearName: 'Engin divers',
            gearWasControlled: true
          }
        ],
        id: null,
        internalReferenceNumber: 'U_W0NTFINDME',
        ircs: 'QGDF',
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
        segments: [{ segment: 'FR_DRB', segmentName: "Drague de mer et d'étang" }],
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
        vesselId: 2,
        vesselName: 'MALOTRU',
        vesselTargeted: true
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')

    // -------------------------------------------------------------------------
    // Form

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    cy.wait(500)

    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: null,
        controlUnits: [],
        diversion: null,
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
            declaredMesh: null,
            gearCode: 'OTB',
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: null
          }
        ],
        id: null,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isFromPoseidon: null,
        latitude: null,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: null,
        logbookInfractions: [],
        logbookMatchesActivity: null,
        longitude: null,
        missionId: 1,
        numberOfVesselsFlownOver: null,
        otherComments: null,
        otherInfractions: [],
        portLocode: null,
        portName: null,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: null,
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [
          { controlledWeight: null, declaredWeight: 13.46, nbFish: null, speciesCode: 'BLI', underSized: false },
          { controlledWeight: null, declaredWeight: 235.6, nbFish: null, speciesCode: 'HKE', underSized: false }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: 'Gaumont',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: false
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should fill the form for a vessel with a control position and prefill the gears, species, fao areas and segments fields', () => {
    editSideWindowMission('MALOTRU')

    // -------------------------------------------------------------------------
    // Form
    cy.get('*[data-cy="action-list-item"]').click()
    cy.wait(500)

    // Engins à bord
    cy.fill('Ajouter un engin', 'PTM')

    // Espèces à bord
    cy.fill('Ajouter une espèce', 'SPR')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('PUT', '/bff/v1/mission_actions/4').as('updateMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@updateMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
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
        gearInfractions: [],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: null,
            gearCode: 'PTM',
            gearName: 'Chaluts-bœufs pélagiques',
            gearWasControlled: null
          }
        ],
        id: 4,
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
        segments: [{ segment: 'PEL01', segmentName: 'Freezer Trawls - Mid water and mid water pair trawl' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: false,
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [
          { controlledWeight: null, declaredWeight: null, nbFish: null, speciesCode: 'SPR', underSized: false }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: null,
        vesselId: 2,
        vesselName: 'MALOTRU',
        vesselTargeted: null
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  // PTM
  // SPR
})
