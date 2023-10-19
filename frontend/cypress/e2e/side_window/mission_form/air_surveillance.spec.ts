import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { interceptExternalCalls } from '../../utils/interceptExternalCalls'

context('Side Window > Mission Form > Air Surveillance', () => {
  beforeEach(() => {
    interceptExternalCalls()

    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance aérienne')
  })

  it('Should fill the form and send the expected data to the API', () => {
    // -------------------------------------------------------------------------
    // Form

    cy.wait(250)

    // Objectifs du vol
    cy.fill('Objectifs du vol', ['Vérifications VMS/AIS'])

    // Segments ciblés
    cy.fill('Segments ciblés', ['FR_DRB', 'FR_ELE'])

    // Nb de navires survolés
    cy.fill('Nb de navires survolés', 15)

    // Observations générales sur le vol
    cy.fill('Observations générales sur le vol', 'Une observation générale sur le vol.')

    // Qualité du contrôle
    cy.fill('Observations sur le déroulé de la surveillance', 'Une observation sur le déroulé de la surveillance.')
    cy.fill('Fiche RETEX nécessaire', true)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    cy.clickButton('Enregistrer et quitter')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // actionDatetimeUtc: '2023-02-20T12:27:49.727Z',
        actionType: 'AIR_SURVEILLANCE',
        closedBy: 'Alice',
        controlQualityComments: 'Une observation sur le déroulé de la surveillance.',
        controlUnits: [],
        emitsAis: null,
        emitsVms: null,
        facade: null,
        feedbackSheetRequired: true,
        flightGoals: ['VMS_AIS_CHECK'],
        gearInfractions: [],
        gearOnboard: [],
        id: null,
        latitude: null,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: null,
        logbookInfractions: [],
        logbookMatchesActivity: null,
        longitude: null,
        missionId: 1,
        numberOfVesselsFlownOver: 15,
        otherComments: 'Une observation générale sur le vol.',
        otherInfractions: [],
        portLocode: null,
        segments: [
          {
            faoAreas: ['37.1', '37.2', '37.3'],
            segment: 'FR_DRB',
            segmentName: "Drague de mer et d'étang"
          },
          {
            faoAreas: ['37.1', '37.2', '37.3', '27.8.a', '27.8.b', '27.7.h', '27.7.e', '27.7.d'],
            segment: 'FR_ELE',
            segmentName: 'Eel sea fisheries'
          }
        ],
        seizureAndDiversion: null,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: null,
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: null,
        userTrigram: 'Marlin',
        vesselId: null,
        vesselName: null,
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
    // Form Live Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

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
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('exist')

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
})
