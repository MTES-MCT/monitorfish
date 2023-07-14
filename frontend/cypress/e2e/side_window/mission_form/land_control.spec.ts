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
    // Form

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer le navire contrôlé.').should('exist')
    cy.contains('Veuillez indiquer le port de contrôle.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme.').should('exist')

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

  it('Should fill mission zone from the last land control added', () => {
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
                [55.08333333333329, 25.875659870303934],
                [55.08431304367669, 25.87561656228202],
                [55.0852833167363, 25.875487055390963],
                [55.08623480619675, 25.875272597133474],
                [55.087158346800194, 25.87497525331534],
                [55.088045042685586, 25.874597888133295],
                [55.08888635312456, 25.874144136567296],
                [55.089674174825596, 25.87361836934528],
                [55.0904009200121, 25.87302565081768],
                [55.09105958952071, 25.872371690149592],
                [55.091643840215184, 25.87166278630123],
                [55.09214804606601, 25.870905767328694],
                [55.09256735230828, 25.870107924590485],
                [55.09289772215658, 25.869276942494878],
                [55.09313597562913, 25.868420824466384],
                [55.09327982010891, 25.867547815844745],
                [55.093327872349946, 25.86666632446024],
                [55.093279671719706, 25.8657848396511],
                [55.09313568455324, 25.86491185050295],
                [55.09289729957985, 25.864055764097728],
                [55.09256681447014, 25.863224824559893],
                [55.092147413635274, 25.862427033678472],
                [55.09164313749579, 25.861670073868922],
                [55.09105884351779, 25.86096123421615],
                [55.090400159394115, 25.860307340309234],
                [55.08967342882268, 25.859714688542823],
                [55.08888565040517, 25.859188985516397],
                [55.08804441025484, 25.858735293113355],
                [55.08715780896205, 25.85835797978808],
                [55.08623438362003, 25.858060678527764],
                [55.085283025660395, 25.857846251893505],
                [55.08431289528748, 25.857716764475953],
                [55.08333333333329, 25.857673463029442],
                [55.082353771379125, 25.857716764475953],
                [55.08138364100622, 25.857846251893505],
                [55.08043228304657, 25.858060678527764],
                [55.07950885770457, 25.85835797978808],
                [55.07862225641176, 25.858735293113355],
                [55.077781016261426, 25.859188985516397],
                [55.07699323784392, 25.859714688542823],
                [55.07626650727249, 25.860307340309234],
                [55.075607823148815, 25.86096123421615],
                [55.075023529170814, 25.861670073868922],
                [55.07451925303133, 25.862427033678472],
                [55.07409985219646, 25.863224824559893],
                [55.07376936708673, 25.864055764097728],
                [55.07353098211336, 25.86491185050295],
                [55.073386994946894, 25.8657848396511],
                [55.07333879431667, 25.86666632446024],
                [55.07338684655768, 25.867547815844745],
                [55.07353069103747, 25.868420824466384],
                [55.073768944510036, 25.869276942494878],
                [55.074099314358335, 25.870107924590485],
                [55.0745186206006, 25.870905767328694],
                [55.07502282645143, 25.87166278630123],
                [55.075607077145904, 25.872371690149592],
                [55.0762657466545, 25.87302565081768],
                [55.07699249184099, 25.87361836934528],
                [55.07778031354204, 25.874144136567296],
                [55.078621623981, 25.874597888133295],
                [55.07950831986642, 25.87497525331534],
                [55.080431860469865, 25.875272597133474],
                [55.0813833499303, 25.875487055390963],
                [55.08235362298991, 25.87561656228202],
                [55.08333333333329, 25.875659870303934]
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
