import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Land Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.LAND)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle à la débarque')
  })

  it('Should fill the form and send the expected data to the API', () => {
    const now = getUtcDateInMultipleFormats()

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
    cy.fill('Qté pesée', 500)
    cy.fill('Sous-taille', true)
    cy.clickButton('Ajouter une infraction espèces')
    cy.fill('Type d’infraction', 'Sans PV')
    cy.fill('NATINF', '23588')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction espèce.')
    cy.clickButton('Valider l’infraction')
    cy.fill('Observations (hors infraction) sur les espèces', 'Une observation hors infraction sur les espèces.')

    // Appréhensions
    cy.fill('Appréhension d’engin(s)', true)
    cy.fill('Appréhension d’espèce(s)', true)
    cy.fill('Appréhension du navire', true)

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

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.include(interception.request.body.actionDatetimeUtc, now.utcDateAsShortString)
      assert.deepInclude(interception.request.body, {
        // actionDatetimeUtc: '2023-02-18T12:09:45.874Z',
        actionType: 'LAND_CONTROL',
        closedBy: 'Alice',
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
            gearWasControlled: null,
            hasUncontrolledMesh: false
          },
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: null,
            gearCode: 'MIS',
            gearName: 'Engin divers',
            gearWasControlled: null,
            hasUncontrolledMesh: false
          }
        ],
        hasSomeGearsSeized: true,
        hasSomeSpeciesSeized: true,
        id: null,
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
        segments: [{ segment: 'NWW01/02', segmentName: 'Trawl' }],
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
        speciesSizeControlled: false,
        speciesWeightControlled: true,
        unitWithoutOmegaGauge: true,
        userTrigram: 'Marlin',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: 'YES'
      })

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()
    const getSaveAndCloseButton = () => cy.get('button').contains('Enregistrer et clôturer').parent()

    // -------------------------------------------------------------------------
    // Form Live Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer le navire contrôlé.').should('exist')
    cy.contains('Veuillez indiquer le port de contrôle.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)
    cy.contains('Veuillez indiquer le navire contrôlé.').should('not.exist')

    // Port de contrôle
    cy.fill('Port de contrôle', 'Auray')
    cy.contains('Veuillez indiquer le port de contrôle.').should('not.exist')

    // Saisi par
    cy.fill('Saisi par', 'Gaumont').wait(500)
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('not.exist')

    // Mission is now valid for saving (but not for closure)
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer et clôturer').wait(500)

    // -------------------------------------------------------------------------
    // Form Closure Validation

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
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('exist')

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

    cy.fill('Engin contrôlé', 'Oui')

    cy.contains("Veuillez indiquer si l'engin a été contrôlé.").should('not.exist')

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

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('not.exist')

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

  it('Should fill the mission zone from the last land control added', () => {
    const now = getUtcDateInMultipleFormats()

    // -------------------------------------------------------------------------
    // Form

    cy.get('*[data-cy="mission-main-form-location"]').should('not.contain', 'Polygone dessiné 1')
    cy.fill('Zone de la mission calculée à partir des contrôles', true)

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
      'Une zone de mission a été ajoutée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should('contain', 'Polygone dessiné 1')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // Add another land control
    cy.clickButton('Ajouter')
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
      'Une zone de mission a été ajoutée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should('contain', 'Polygone dessiné 1')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/api/v1/mission', {
      statusCode: 201
    }).as('createMission')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnits: [
          {
            administration: 'DDTM',
            contact: null,
            id: 10001,
            isArchived: false,
            name: 'Cultures marines – DDTM 40',
            resources: [
              {
                id: 2,
                name: 'Semi-rigide 2'
              }
            ]
          }
        ],
        geom: {
          coordinates: [
            [
              [
                [55.08333333333329, 25.88015647212255],
                [55.08480295451979, 25.880091507622822],
                [55.08625841764026, 25.87989723998035],
                [55.08768570116363, 25.879575540730272],
                [55.08907105530665, 25.879129509037483],
                [55.09040113461571, 25.87856344181091],
                [55.09166312663458, 25.877882792268636],
                [55.092844875413114, 25.87709411735581],
                [55.09393499866325, 25.87620501452396],
                [55.09492299743044, 25.87522404848336],
                [55.095799357222425, 25.874160668636918],
                [55.0965556396205, 25.87302511799406],
                [55.09718456349203, 25.871828334445155],
                [55.097680075023916, 25.870581845349776],
                [55.09803740590617, 25.86929765645756],
                [55.098253119109536, 25.867988136233166],
                [55.09832514182208, 25.866665896702088],
                [55.09825278523382, 25.86534367196566],
                [55.098036750985415, 25.864034195556684],
                [55.097679124226346, 25.86275007781684],
                [55.09718335335625, 25.861503684476418],
                [55.09655421665136, 25.860307017605308],
                [55.095797776103815, 25.859171600079137],
                [55.09492131892386, 25.858108364672745],
                [55.093933287272755, 25.857127548844787],
                [55.0928431969065, 25.856238596225623],
                [55.09166154551591, 25.855450065752848],
                [55.090399711646505, 25.8547695493273],
                [55.0890698451708, 25.854203598778497],
                [55.08768475036598, 25.85375766284072],
                [55.086257762719455, 25.853436034743012],
                [55.08480262064406, 25.853241810915932],
                [55.08333333333329, 25.853176861210827],
                [55.08186404602255, 25.853241810915932],
                [55.08040890394716, 25.853436034743012],
                [55.07898191630062, 25.85375766284072],
                [55.07759682149581, 25.854203598778497],
                [55.0762669550201, 25.8547695493273],
                [55.07500512115069, 25.855450065752848],
                [55.0738234697601, 25.856238596225623],
                [55.07273337939383, 25.857127548844787],
                [55.07174534774273, 25.858108364672745],
                [55.070868890562785, 25.859171600079137],
                [55.07011245001525, 25.860307017605308],
                [55.06948331331036, 25.861503684476418],
                [55.06898754244026, 25.86275007781684],
                [55.0686299156812, 25.864034195556684],
                [55.06841388143279, 25.86534367196566],
                [55.06834152484452, 25.866665896702088],
                [55.06841354755708, 25.867988136233166],
                [55.06862926076043, 25.86929765645756],
                [55.068986591642684, 25.870581845349776],
                [55.06948210317457, 25.871828334445155],
                [55.07011102704609, 25.87302511799406],
                [55.07086730944416, 25.874160668636918],
                [55.07174366923615, 25.87522404848336],
                [55.072731668003364, 25.87620501452396],
                [55.073821791253486, 25.87709411735581],
                [55.075003540032036, 25.877882792268636],
                [55.0762655320509, 25.87856344181091],
                [55.07759561135997, 25.879129509037483],
                [55.07898096550298, 25.879575540730272],
                [55.08040824902635, 25.87989723998035],
                [55.08186371214683, 25.880091507622822],
                [55.08333333333329, 25.88015647212255]
              ]
            ]
          ],
          type: 'MultiPolygon'
        },
        isClosed: false,
        isGeometryComputedFromControls: true,
        isUnderJdp: true,
        isValid: true,
        missionSource: 'MONITORFISH',
        missionTypes: ['LAND']
      })

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
