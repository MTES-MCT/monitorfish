import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'

context('Side Window > Mission Form > Air Surveillance', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance aérienne')

    cy.wait(250)
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')
    cy.intercept('PUT', '/bff/v1/mission_actions/1', {
      body: {
        id: 1
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

        // Clôturé par
        // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
        cy.get('[name="closedBy"]').eq(1).type('Alice')

        cy.wait(500)

        // -------------------------------------------------------------------------
        // Request

        cy.waitForLastRequest(
          '@updateMissionAction',
          {
            body: {
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
              id: 1,
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
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getCloseButton = () => cy.get('button').contains('Clôturer').parent()

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

    cy.clickButton('Clôturer').wait(500)

    // -------------------------------------------------------------------------
    // Form Closure Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('exist')

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('not.exist')
    cy.contains('Ré-ouvrir la mission').should('not.exist')

    // Mission is now valid for closure
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')
    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')
    cy.wait(500)
    cy.clickButton('Clôturer')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
