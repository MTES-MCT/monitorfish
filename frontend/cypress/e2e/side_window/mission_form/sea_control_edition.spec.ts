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
      'bff/v1/fleet_segments/compute?faoAreas=27.8.a&gears=PTM&species=SPR&latitude=53.35&longitude=-10.85&portLocode='
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
        diversion: null,
        emitsAis: null,
        emitsVms: 'NOT_APPLICABLE',
        externalReferenceNumber: null,
        facade: 'MEMN',
        faoAreas: ['27.8.a'],
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
        isFromPoseidon: null,
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
        portName: null,
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
})
