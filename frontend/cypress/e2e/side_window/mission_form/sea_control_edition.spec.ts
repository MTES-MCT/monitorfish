import { editSideWindowMission } from './utils'

context('Side Window > Mission Form > Sea Control Edition', () => {
  beforeEach(() => {
    editSideWindowMission('MALOTRU')
  })

  it('Should fill the form for a vessel with a control position and prefill the gears, species, fao areas and segments fields', () => {
    // -------------------------------------------------------------------------
    // Form
    cy.get('*[data-cy="action-list-item"]').click()
    cy.wait(500)

    // Engins à bord
    cy.fill('Ajouter un engin', 'PTM')

    // Espèces à bord
    cy.intercept(
      'GET',
      'bff/v1/fleet_segments/compute?faoAreas=27.7.b&gears=PTM&species=SPR&latitude=53.35&longitude=-10.85&portLocode='
    ).as('computeSegment')
    cy.fill('Ajouter une espèce', 'SPR')
    cy.wait('@computeSegment')

    cy.wait(500)
    // We need to wait for some time because there is a throttle on the form
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('PUT', '/bff/v1/mission_actions/4', {
      body: {
        id: 4
      },
      statusCode: 201
    }).as('updateMissionAction')

    cy.clickButton('Enregistrer')

    cy.wait('@updateMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: null,
        controlUnits: [],
        districtCode: null,
        emitsAis: null,
        emitsVms: 'NOT_APPLICABLE',
        externalReferenceNumber: null,
        facade: 'MEMN',
        faoAreas: ['27.7.b'],
        feedbackSheetRequired: false,
        flagState: 'FR',
        gearInfractions: [],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: null,
            gearCode: 'PTM',
            gearName: 'Chaluts-bœufs pélagiques',
            gearWasControlled: null
          }
        ],
        id: 4,
        internalReferenceNumber: 'U_W0NTFINDME',
        ircs: null,
        latitude: 53.35,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: 'NOT_APPLICABLE',
        logbookInfractions: [],
        logbookMatchesActivity: 'NOT_APPLICABLE',
        longitude: -10.85,
        missionId: 4,
        numberOfVesselsFlownOver: null,
        otherComments: 'Commentaires post contrôle',
        otherInfractions: [],
        portLocode: null,
        segments: [{ segment: 'PEL01', segmentName: 'Freezer Trawls - Mid water and mid water pair trawl' }],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: 'NO',
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [
          { controlledWeight: null, declaredWeight: null, nbFish: null, speciesCode: 'SPR', underSized: false }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: 'JKL',
        vesselId: 2,
        vesselName: 'MALOTRU',
        vesselTargeted: 'YES'
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should modify the controlled vessel and updated the gears, species, faoAreas and segments fields', () => {
    // -------------------------------------------------------------------------
    // Form
    cy.get('*[data-cy="action-list-item"]').click()
    cy.wait(500)

    cy.intercept(
      'GET',
      'bff/v1/fleet_segments/compute?faoAreas=27.8.b,27.8.c&gears=OTB&species=HKE,BLI&latitude=53.35&longitude=-10.85&portLocode='
    ).as('computeFleetSegments')
    cy.get('input[placeholder="Rechercher un navire..."]').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}pheno'
    )
    cy.contains('mark', 'PHENO').click()

    cy.wait('@computeFleetSegments')

    // We need to wait for some time because there is a throttle on the form
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('PUT', '/bff/v1/mission_actions/4', {
      body: {
        id: 4
      },
      statusCode: 201
    }).as('updateMissionAction')

    cy.clickButton('Enregistrer')

    /**
     * The gears, species, faoAreas and segments fields should be linked to PHENOMENE, and no more MALOTRU
     */
    cy.wait('@updateMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: null,
        controlUnits: [],
        districtCode: 'AY',
        emitsAis: null,
        emitsVms: 'NOT_APPLICABLE',
        externalReferenceNumber: 'DONTSINK',
        facade: 'MEMN',
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
            gearWasControlled: null
          }
        ],
        id: 4,
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        latitude: 53.35,
        licencesAndLogbookObservations: null,
        licencesMatchActivity: 'NOT_APPLICABLE',
        logbookInfractions: [],
        logbookMatchesActivity: 'NOT_APPLICABLE',
        longitude: -10.85,
        missionId: 4,
        numberOfVesselsFlownOver: null,
        otherComments: 'Commentaires post contrôle',
        otherInfractions: [],
        portLocode: null,
        segments: [
          {
            segment: 'SWW01/02/03',
            segmentName: 'Bottom trawls'
          }
        ],
        seizureAndDiversion: false,
        seizureAndDiversionComments: null,
        separateStowageOfPreservedSpecies: 'NO',
        speciesInfractions: [],
        speciesObservations: null,
        speciesOnboard: [
          {
            controlledWeight: null,
            declaredWeight: 471.2,
            nbFish: null,
            speciesCode: 'HKE',
            underSized: false
          },
          {
            controlledWeight: null,
            declaredWeight: 13.46,
            nbFish: null,
            speciesCode: 'BLI',
            underSized: false
          }
        ],
        speciesSizeControlled: null,
        speciesWeightControlled: null,
        unitWithoutOmegaGauge: false,
        userTrigram: 'JKL',
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: 'YES'
      })
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
