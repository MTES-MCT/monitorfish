import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'

context('Side Window > Mission Form > Air Surveillance', () => {
  beforeEach(() => {
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

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // actionDatetimeUtc: '2023-02-20T12:27:49.727Z',
        actionType: 'AIR_SURVEILLANCE',
        controlQualityComments: 'Une observation sur le déroulé de la surveillance.',
        controlUnits: [],
        diversion: null,
        emitsAis: null,
        emitsVms: null,
        facade: null,
        feedbackSheetRequired: true,
        flightGoals: ['VMS_AIS_CHECK'],
        gearInfractions: [],
        gearOnboard: [],
        id: null,
        isFromPoseidon: null,
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
        portName: null,
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
        vesselTargeted: false
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
