import { editSideWindowMission } from './utils'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Sea Control Edition', () => {
  beforeEach(() => {
    editSideWindowMission('MALOTRU')
  })

  it('Should fill the form for a vessel with a control position and prefill the gears, species, fao areas and segments fields', () => {
    cy.intercept('PUT', '/bff/v1/mission_actions/4', {
      body: {
        id: 4
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form
    cy.get('*[data-cy="action-list-item"]').click()
    cy.wait(500)

    // Engins à bord
    cy.fill('Ajouter un engin', 'PTM')

    // Espèces à bord
    cy.intercept('GET', 'bff/v1/fleet_segments/compute?faoAreas=27.8.a&gears=PTM&species=SPR').as('computeSegment')
    cy.fill('Ajouter une espèce', 'SPR')
    cy.wait('@computeSegment')

    cy.wait(500)
    // We need to wait for some time because there is a throttle on the form
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
          actionType: 'SEA_CONTROL',
          closedBy: null,
          controlQualityComments: null,
          controlUnits: [],
          districtCode: null,
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
              gearWasControlled: null,
              hasUncontrolledMesh: false
            }
          ],
          hasSomeGearsSeized: false,
          hasSomeSpeciesSeized: false,
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
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should modify the controlled vessel and updated the gears, species, faoAreas and segments fields', () => {
    cy.intercept('PUT', '/bff/v1/mission_actions/4', {
      body: {
        id: 4
      },
      statusCode: 201
    }).as('updateMissionAction')

    // -------------------------------------------------------------------------
    // Form
    cy.get('*[data-cy="action-list-item"]').click()
    cy.wait(500)

    cy.intercept('GET', 'bff/v1/fleet_segments/compute?faoAreas=27.8.b,27.8.c&gears=OTB&species=HKE,BLI').as(
      'computeFleetSegments'
    )
    cy.get('input[placeholder="Rechercher un navire..."]').clear().type('phe')
    cy.contains('mark', 'PHE').click()

    cy.wait('@computeFleetSegments')

    // We need to wait for some time because there is a throttle on the form
    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    /**
     * The gears, species, faoAreas and segments fields should be linked to PHENOMENE, and no more MALOTRU
     */
    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
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
              gearWasControlled: null,
              hasUncontrolledMesh: false
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
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it(
    'Should update actions When auto save is not enabled',
    {
      env: {
        FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: false
      }
    },
    () => {
      cy.intercept('PUT', '/bff/v1/mission_actions/4', {
        body: {
          id: 4
        },
        statusCode: 201
      }).as('updateMissionAction')

      // -------------------------------------------------------------------------
      // Form
      const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
      cy.fill('Fin de mission', endDate.utcDateTupleWithTime)

      cy.get('*[data-cy="action-list-item"]').click()
      cy.wait(500)

      cy.fill(
        'Observations (hors infractions) sur les obligations déclaratives / autorisations',
        'Une nouvelle observation'
      )
      // We need to wait for some time because there is a throttle on the form
      cy.wait(500)
      cy.clickButton('Enregistrer')

      // -------------------------------------------------------------------------
      // Request

      cy.waitForLastRequest(
        '@updateMissionAction',
        {
          body: {
            licencesAndLogbookObservations: 'Une nouvelle observation'
          }
        },
        5
      )
        .its('response.statusCode')
        .should('eq', 201)
    }
  )
})
