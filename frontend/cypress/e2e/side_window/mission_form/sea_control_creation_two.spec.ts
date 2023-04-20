import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'

context('Side Window > Mission Form > Sea Control Creation two', () => {
  beforeEach(() => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle en mer')
  })

  it('Should fill the form for a vessel with logbook and prefill the gears, species, fao areas and segments fields', () => {
    // -------------------------------------------------------------------------
    // Form

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    cy.wait(500)

    cy.fill('Saisi par', 'Gaumont')
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: null,
        controlUnits: [],
        diversion: null,
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
            declaredMesh: null,
            gearCode: 'OTB',
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: null
          }
        ],
        id: null,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        isFromPoseidon: null,
        latitude: null,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: null,
        logbookInfractions: [],
        logbookMatchesActivity: null,
        longitude: null,
        missionId: 1,
        numberOfVesselsFlownOver: null,
        otherComments: null,
        otherInfractions: [],
        portLocode: null,
        portName: null,
        segments: [{ segment: 'SWW01/02/03', segmentName: 'Bottom trawls' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: null,
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [
          { controlledWeight: null, declaredWeight: 13.46, nbFish: null, speciesCode: 'BLI', underSized: false },
          { controlledWeight: null, declaredWeight: 235.6, nbFish: null, speciesCode: 'HKE', underSized: false }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: 'Gaumont',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: false
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
