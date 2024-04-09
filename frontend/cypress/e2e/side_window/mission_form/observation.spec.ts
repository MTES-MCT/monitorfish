import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'

context('Side Window > Mission Form > Observation', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.getDataCy('action-completion-status').contains('1 champ nécessaire aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('createMissionAction')

    // -------------------------------------------------------------------------
    // Form

    // Autres observations
    cy.fill('Observations, commentaires...', 'Une observation.')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    // The request is a POST as there is no modification after the action creation
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

    cy.getDataCy('action-completion-status').contains('Les champs nécessaires aux statistiques sont complétés.')
    cy.getDataCy('action-all-fields-completed').should('exist')
  })
})
