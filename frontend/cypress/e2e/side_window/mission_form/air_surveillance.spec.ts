import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'

context('Side Window > Mission Form > Air Surveillance', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance aérienne')

    cy.wait(250)
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.getDataCy('action-completion-status').contains('2 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('createMissionAction')
    cy.intercept('PUT', '/bff/v1/mission_actions/2', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form

    // Objectifs du vol
    cy.fill('Objectifs du vol', ['Vérifications VMS/AIS'])

    // Segments ciblés
    // TODO Find a better way to handle this flaky test.
    // Very dirty hack to bypass the fact that some fleet segments are sometimes unavailable in the test environment.
    const expectedSegments: any[] = []
    cy.contains('Segments ciblés')
      .parent()
      .find('.rs-picker-toggle')
      .click({ force: true })
      .wait(250)
      .then(() => {
        if (Cypress.$('span[title="ATL01 - All Trawls 3"]').length) {
          cy.contains('ATL01 - All Trawls 3').forceClick()
          expectedSegments.push({
            faoAreas: ['27.7', '27.8', '27.9', '27.10'],
            segment: 'ATL01',
            segmentName: 'All Trawls 3'
          })
        }
        if (Cypress.$('span[title="FR_DRB - Drague de mer et d\'étang"]').length) {
          cy.contains("FR_DRB - Drague de mer et d'étang").forceClick()
          expectedSegments.push({
            faoAreas: ['37.1', '37.2', '37.3'],
            segment: 'FR_DRB',
            segmentName: "Drague de mer et d'étang"
          })
        }
        if (Cypress.$('span[title="FFR_ELE - Eel sea fisheries"]').length) {
          cy.contains('FFR_ELE - Eel sea fisheries').forceClick()
          expectedSegments.push({
            faoAreas: ['37.1', '37.2', '37.3', '27.8.a', '27.8.b', '27.7.h', '27.7.e', '27.7.d'],
            segment: 'FR_ELE',
            segmentName: 'Eel sea fisheries'
          })
        }

        // Nb de navires survolés
        cy.fill('Nb de navires survolés', 15)

        // Observations générales sur le vol
        cy.fill('Observations générales sur le vol', 'Une observation générale sur le vol.')

        // Qualité du contrôle
        cy.fill('Observations sur le déroulé de la surveillance', 'Une observation sur le déroulé de la surveillance.')
        cy.fill('Fiche RETEX nécessaire', true)

        // Saisi par
        cy.fill('Saisi par', 'Marlin')

        // Complété par
        cy.fill('Complété par', 'Alice')

        cy.wait(500)

        // -------------------------------------------------------------------------
        // Request

        cy.waitForLastRequest(
          '@updateMissionAction',
          {
            body: {
              actionType: 'AIR_SURVEILLANCE',
              completedBy: 'Alice',
              controlQualityComments: 'Une observation sur le déroulé de la surveillance.',
              controlUnits: [],
              emitsAis: null,
              emitsVms: null,
              facade: null,
              feedbackSheetRequired: true,
              flightGoals: ['VMS_AIS_CHECK'],
              gearInfractions: [],
              gearOnboard: [],
              id: 2,
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
              segments: expectedSegments,
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

    cy.getDataCy('action-completion-status').contains('Les champs nécessaires aux statistiques sont complétés.')
    cy.getDataCy('action-all-fields-completed').should('exist')
  })
})
