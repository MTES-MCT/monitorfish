import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { interceptExternalCalls } from '../../utils/interceptExternalCalls'

context('Side Window > Mission Form > Observation', () => {
  beforeEach(() => {
    interceptExternalCalls()

    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')
  })

  it('Should fill the form and send the expected data to the API', () => {
    // -------------------------------------------------------------------------
    // Form

    // Autres observations
    cy.fill('Observations, commentaires...', 'Une observation.')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

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
        // actionDatetimeUtc: '2023-02-20T12:31:46.093Z',
        actionType: 'OBSERVATION',
        controlQualityComments: null,
        controlUnits: [],
        emitsAis: null,
        emitsVms: null,
        facade: null,
        feedbackSheetRequired: null,
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
        numberOfVesselsFlownOver: null,
        otherComments: 'Une observation.',
        otherInfractions: [],
        portLocode: null,
        segments: [],
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
