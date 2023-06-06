import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Sea Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')
  })

  it('Should fill the form with an unknown vessel and send the expected data to the API', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer').parent()
    // -------------------------------------------------------------------------
    // Form

    getSaveButton().should('be.disabled')

    cy.fill('Navire inconnu', true)

    cy.wait(500)

    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        externalReferenceNumber: 'UNKNOWN',
        flagState: 'UNKNOWN',
        internalReferenceNumber: 'UNKNOWN',
        ircs: 'UNKNOWN',
        vesselId: -1,
        vesselName: 'UNKNOWN'
      })

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should fill the form and send the expected data to the API', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer').parent()
    const now = getUtcDateInMultipleFormats()

    // -------------------------------------------------------------------------
    // Form

    getSaveButton().should('be.disabled')

    // Rechercher un navire...
    cy.get('input[placeholder="Rechercher un navire..."]').type('malot')
    cy.contains('mark', 'MALOT').click()

    cy.wait(500)

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

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
    // This will modify the "Maillage mesuré" input as null
    cy.fill('Maillage non mesuré', true)

    cy.fill('Ajouter un engin', 'OTB')

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

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.include(interception.request.body.actionDatetimeUtc, now.utcDateAsShortString)
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
            declaredMesh: 10,
            gearCode: 'MIS',
            gearName: 'Engin divers',
            gearWasControlled: true
          },
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
        segments: [],
        seizureAndDiversion: true,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: 'YES',
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
        vesselTargeted: 'YES'
      })

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer').parent()
    // -------------------------------------------------------------------------
    // Form

    getSaveButton().should('be.disabled')
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    cy.wait(500)

    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)
    getSaveButton().should('not.be.disabled')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

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
            declaredMesh: 70,
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
          { controlledWeight: null, declaredWeight: 471.2, nbFish: null, speciesCode: 'HKE', underSized: false },
          { controlledWeight: null, declaredWeight: 13.46, nbFish: null, speciesCode: 'BLI', underSized: false }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: 'Gaumont',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: 'NO'
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
