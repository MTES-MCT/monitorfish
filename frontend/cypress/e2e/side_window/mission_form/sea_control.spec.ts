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
    const now = getUtcDateInMultipleFormats()
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

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

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          actionType: 'SEA_CONTROL',
          closedBy: 'Alice',
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
        }
      },
      10
    )
      .its('response.statusCode')
      .should('eq', 201)

    /*
      TODO add these remaining tests :
      assert.include(interception.request.body.actionDatetimeUtc, now.utcDateAsShortString)
      assert.isUndefined(interception.request.body.gearOnboard[0].controlledMesh)
     */
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    // Saisi par
    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          actionType: 'SEA_CONTROL',
          closedBy: 'Alice',
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
        }
      },
      10
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getCloseButton = () => cy.get('button').contains('Clôturer').parent()

    // -------------------------------------------------------------------------
    // Form Live Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer le navire contrôlé.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getCloseButton().should('be.disabled')

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)
    cy.contains('Veuillez indiquer le navire contrôlé.').should('not.exist')

    // Saisi par
    cy.fill('Saisi par', 'Gaumont').wait(500)
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('not.exist')

    // Mission is now valid for saving (but not for closure)
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    getCloseButton().should('be.enabled')

    cy.clickButton('Clôturer').wait(500)

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
    cy.contains('Ré-ouvrir la mission').should('not.exist')

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
    cy.wait(250)
    cy.clickButton('Clôturer')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should add, edit, remove and validate gears infractions as expected', () => {
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
    // Click the "X" button in the NATINF tag
    cy.contains('23581 - Taille de maille non réglementaire')
      .parentsUntil('.rs-picker-toggle')
      .find('.rs-picker-toggle-clean')
      .forceClick()
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
    const now = getUtcDateInMultipleFormats()
    cy.intercept('POST', '/api/v1/mission', {
      statusCode: 201
    }).as('createMission')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      statusCode: 201
    }).as('createMissionAction')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Form

    cy.get('*[data-cy="mission-main-form-location"]').should('not.contain', 'Polygone dessiné 1')
    cy.wait(250)
    cy.fill('Zone de la mission calculée à partir des contrôles', true)

    // A mission zone should be automatically added (because of the stubbed coordinates update when IS_CYPRESS LocalSorage key is "true")
    cy.get('.Toastify__toast--success').contains(
      'Une zone de mission a été ajoutée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should('contain', 'Polygone dessiné 1')

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
      'Une zone de mission a été ajoutée à partir des contrôles de la mission'
    )
    cy.get('*[data-cy="mission-main-form-location"]').should('contain', 'Polygone dessiné 1')

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
      '@createMission',
      {
        body: {
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
                  [-3.872, 47.11997281454899],
                  [-3.866818340009837, 47.11979947882685],
                  [-3.86168668266924, 47.119281144347354],
                  [-3.856654545205034, 47.118422812932465],
                  [-3.851770478823053, 47.1172327669843],
                  [-3.847081597706614, 47.11572248909647],
                  [-3.8426331222800583, 47.11390655063039],
                  [-3.8384679412517877, 47.1118024703614],
                  [-3.8346261967492987, 47.10943054459656],
                  [-3.8311448966116, 47.106813650444394],
                  [-3.8280575576154847, 47.10397702418069],
                  [-3.8253938830851637, 47.10094801689485],
                  [-3.8231794779741706, 47.09775582982175],
                  [-3.8214356041187667, 47.094431231955554],
                  [-3.8201789779481286, 47.091006262710266],
                  [-3.819421612503582, 47.087513922529524],
                  [-3.819170705171962, 47.08398785445689],
                  [-3.8194285720820487, 47.080462019757306],
                  [-3.820192629652871, 47.07697037072717],
                  [-3.821455423323367, 47.0735465238497],
                  [-3.823204703038934, 47.070223436436635],
                  [-3.825423544626324, 47.06703308985621],
                  [-3.828090515757874, 47.06400618237359],
                  [-3.8311798847932277, 47.06117183452949],
                  [-3.8346618703944726, 47.058557309855075],
                  [-3.838502929442331, 47.05618775356834],
                  [-3.842666080438922, 47.05408595172014],
                  [-3.847111259269298, 47.05227211305896],
                  [-3.851795703911114, 47.05076367566588],
                  [-3.8566743644311576, 47.049575140172834],
                  [-3.861700334390457, 47.04871793112744],
                  [-3.8668252995972194, 47.048200287799745],
                  [-3.872, 47.04802718545105],
                  [-3.877174700402781, 47.048200287799745],
                  [-3.882299665609542, 47.04871793112744],
                  [-3.887325635568842, 47.049575140172834],
                  [-3.8922042960888863, 47.05076367566588],
                  [-3.896888740730702, 47.05227211305896],
                  [-3.9013339195610777, 47.05408595172014],
                  [-3.905497070557668, 47.05618775356834],
                  [-3.9093381296055276, 47.058557309855075],
                  [-3.912820115206772, 47.06117183452949],
                  [-3.9159094842421256, 47.06400618237359],
                  [-3.9185764553736764, 47.06703308985621],
                  [-3.920795296961065, 47.070223436436635],
                  [-3.922544576676633, 47.0735465238497],
                  [-3.923807370347128, 47.07697037072717],
                  [-3.9245714279179507, 47.080462019757306],
                  [-3.9248292948280374, 47.08398785445689],
                  [-3.9245783874964184, 47.087513922529524],
                  [-3.923821022051871, 47.091006262710266],
                  [-3.9225643958812326, 47.094431231955554],
                  [-3.9208205220258296, 47.09775582982175],
                  [-3.918606116914836, 47.10094801689485],
                  [-3.9159424423845146, 47.10397702418069],
                  [-3.9128551033883996, 47.106813650444394],
                  [-3.909373803250701, 47.10943054459656],
                  [-3.905532058748211, 47.1118024703614],
                  [-3.901366877719942, 47.11390655063039],
                  [-3.8969184022933865, 47.11572248909647],
                  [-3.892229521176947, 47.1172327669843],
                  [-3.8873454547949664, 47.118422812932465],
                  [-3.882313317330759, 47.119281144347354],
                  [-3.8771816599901627, 47.11979947882685],
                  [-3.872, 47.11997281454899]
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
          missionTypes: ['SEA']
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should remove the other control fields When the previous PAM control unit is modified', () => {
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Main Form

    // Add a PAM control unit
    cy.get('span[role="button"][title="Clear"]').eq(0).click({ force: true })
    cy.get('span[role="button"][title="Clear"]').eq(1).click({ force: true })
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

    // Remove the PAM control unit
    cy.get('span[role="button"][title="Clear"]').eq(0).click({ force: true })
    cy.get('span[role="button"][title="Clear"]').eq(1).click({ force: true })
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')

    cy.get('legend')
      .filter(':contains("Autre(s) contrôle(s) effectué(s) par l’unité sur le navire")')
      .should('have.length', 0)

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
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
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Main Form

    cy.get('legend')
      .filter(':contains("Autre(s) contrôle(s) effectué(s) par l’unité sur le navire")')
      .should('have.length', 0)

    // Add a PAM control unit
    cy.get('span[role="button"][title="Clear"]').eq(0).click({ force: true })
    cy.get('span[role="button"][title="Clear"]').eq(1).click({ force: true })
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
    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

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

    cy.wait('@createMissionAction').then(interception => {
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

      cy.fill('Saisi par', 'Marlin')

      cy.wait('@updateMissionAction')
    })
  })
})
