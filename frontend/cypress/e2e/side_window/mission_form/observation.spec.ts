import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'

context('Side Window > Mission Form > Observation', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

    // Autres observations
    cy.fill('Observations, commentaires...', 'Une observation.')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
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
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getCloseButton = () => cy.get('button').contains('Clôturer').parent()
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form Live Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getCloseButton().should('be.disabled')

    // Saisi par
    cy.fill('Saisi par', 'Gaumont').wait(500)
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('not.exist')

    // Mission is now valid for saving (but not for closure)
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    getCloseButton().should('be.enabled')

    // -------------------------------------------------------------------------
    // Request

    cy.clickButton('Clôturer')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
