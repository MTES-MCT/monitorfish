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
    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()

    // -------------------------------------------------------------------------
    // Form

    getSaveButton().should('be.disabled')

    cy.fill('Navire inconnu', true)
    cy.fill('Ajouter un engin', 'MIS')
    // The "Lieu du contrôle" field is stubbed in FormikCoordinatesPicker

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

    cy.clickButton('Enregistrer et quitter')

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
    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()
    const now = getUtcDateInMultipleFormats()

    // -------------------------------------------------------------------------
    // Form

    getSaveButton().should('be.disabled')

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
    // This will modify the "Maillage mesuré" input as `undefined`
    cy.fill('Maillage non mesuré', true)
    cy.fill('MIS : autres mesures et dispositifs', 'Autres mesures.')

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
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction espèce.')
    cy.clickButton('Valider l’infraction')
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhension et déroutement
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
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

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.include(interception.request.body.actionDatetimeUtc, now.utcDateAsShortString)
      assert.isUndefined(interception.request.body.gearOnboard[0].controlledMesh)
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
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
            gearWasControlled: null,
            hasUncontrolledMesh: false
          }
        ],
        hasSomeGearsSeized: true,
        hasSomeSpeciesSeized: true,
        id: null,
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
      })

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()

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

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
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
        id: null,
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
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()
    const getSaveAndCloseButton = () => cy.get('button').contains('Enregistrer et clôturer').parent()

    // -------------------------------------------------------------------------
    // Form

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer le navire contrôlé.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme.').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)
    cy.contains('Veuillez indiquer le navire contrôlé.').should('not.exist')

    // Saisi par
    cy.fill('Saisi par', 'Gaumont').wait(500)
    cy.contains('Veuillez indiquer votre trigramme.').should('not.exist')

    // Mission is now valid for saving (but not for closure)
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer et clôturer').wait(500)

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer si le navire émet un signal VMS.').should('exist')
    cy.contains('Veuillez indiquer si le navire émet un signal AIS.').should('exist')
    cy.contains('Veuillez indiquer si le journal de bord correspond à l’activité du navire.').should('exist')
    cy.contains('Veuillez indiquer si les licences correspondent à l’activité du navire.').should('exist')
    cy.contains('Veuillez indiquer les engins à bord.').should('exist')
    cy.contains('Veuillez indiquer si le poids des espèces a été contrôlé.').should('exist')
    cy.contains('Veuillez indiquer si la taille des espèces a été contrôlée.').should('exist')
    cy.contains('Veuillez indiquer si les espèces soumises à plan sont séparées.').should('exist')
    cy.contains('Veuillez indiquer si le navire est ciblé par le CNSP.').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    // Obligations déclaratives et autorisations de pêche
    cy.fill('Bonne émission VMS', 'Oui')
    cy.fill('Bonne émission AIS', 'Non')
    cy.fill('Déclarations journal de pêche conformes à l’activité du navire', 'Non concerné')
    cy.fill('Autorisations de pêche conformes à l’activité du navire (zone, engins, espèces)', 'Non')

    cy.contains('Veuillez indiquer si le navire émet un signal VMS.').should('not.exist')
    cy.contains('Veuillez indiquer si le navire émet un signal AIS.').should('not.exist')
    cy.contains('Veuillez indiquer si le journal de bord correspond à l’activité du navire.').should('not.exist')
    cy.contains('Veuillez indiquer si les licences correspondent à l’activité du navire.').should('not.exist')

    // Engins à bord
    cy.fill('Ajouter un engin', 'MIS')

    cy.contains('Veuillez indiquer les engins à bord.').should('not.exist')
    cy.contains("Veuillez indiquer si l'engin a été contrôlé.").should('exist')
    cy.contains('Veuillez indiquer le maillage déclaré.').should('exist')
    cy.contains('Veuillez indiquer le maillage mesuré.').should('exist')

    cy.fill('Engin contrôlé', 'Oui')
    cy.fill('Maillage déclaré', 50)
    cy.fill('Maillage mesuré', 30)

    cy.contains("Veuillez indiquer si l'engin a été contrôlé.").should('not.exist')
    cy.contains('Veuillez indiquer le maillage déclaré.').should('not.exist')
    cy.contains('Veuillez indiquer le maillage mesuré.').should('not.exist')

    // Espèces à bord
    cy.fill('Poids des espèces vérifiés', 'Oui')
    cy.fill('Taille des espèces vérifiées', 'Non')
    cy.fill('Arrimage séparé des espèces soumises à plan', 'Oui')

    cy.contains('Veuillez indiquer si le poids des espèces a été contrôlé.').should('not.exist')
    cy.contains('Veuillez indiquer si la taille des espèces a été contrôlée.').should('not.exist')
    cy.contains('Veuillez indiquer si les espèces soumises à plan sont séparées.').should('not.exist')

    // Qualité du contrôle
    cy.fill('Navire ciblé par le CNSP', 'Non')

    cy.contains('Veuillez indiquer si le navire est ciblé par le CNSP.').should('not.exist')

    // Mission is now valid for closure
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer et clôturer')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
