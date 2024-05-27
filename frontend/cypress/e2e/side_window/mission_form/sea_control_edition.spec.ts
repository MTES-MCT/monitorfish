import { editSideWindowMission } from './utils'
import { SeafrontGroup } from '../../../../src/constants/seafront'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import { editSideWindowMissionListMissionWithId, openSideWindowMissionList } from '../mission_list/utils'

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
          completedBy: null,
          completion: 'TO_COMPLETE',
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

    cy.getDataCy('action-completion-status').contains('5 champs nécessaires aux statistiques à compléter')
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

  /**
   * Non-regression test to prevent mission actions IDs to be modified instead of update the right ID.
   *
   * Bug case:
   *  1. The first control in this test has the id `4`
   *  2. A new control is added
   *  3. We save the form
   *  3. The bug was sending :
   *    - 1 POST request with the data of the first control (instead of an update of the id `4`)
   *    - 1 PUT request with the date of the new control (instead of a creation with a POST request)
   */
  it(
    'Should update actions and keep existing actions ids',
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
      cy.intercept('POST', '/bff/v1/mission_actions', {
        body: {
          id: 5
        },
        statusCode: 201
      }).as('createMissionAction')

      // -------------------------------------------------------------------------
      // Form
      const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
      cy.fill('Fin de mission', endDate.utcDateTupleWithTime)

      // Add another control
      cy.clickButton('Ajouter')
      cy.clickButton('Ajouter un contrôle en mer')

      // Navire
      // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      cy.get('input[placeholder="Rechercher un navire..."]').type('FR263418260').wait(250)
      cy.contains('mark', 'FR263418260').click()

      // Date et heure du contrôle
      cy.fill('Date et heure du contrôle', endDate.utcDateTupleWithTime)

      // Saisi par
      cy.fill('Saisi par', 'Marlin')

      // We need to wait for some time because there is a throttle on the form
      cy.wait(500)
      cy.clickButton('Enregistrer')

      // -------------------------------------------------------------------------
      // Request

      cy.waitForLastRequest(
        '@updateMissionAction',
        {
          body: {
            internalReferenceNumber: 'U_W0NTFINDME',
            vesselName: 'MALOTRU'
          }
        },
        5
      )
        .its('response.statusCode')
        .should('eq', 201)
      cy.wait('@createMissionAction')
    }
  )

  it('Should not update the mission zone When a CACEM control is newer', () => {
    editSideWindowMissionListMissionWithId(34, SeafrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/34', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission34')
    cy.intercept('PUT', '/bff/v1/mission_actions/9', {
      body: {
        id: 1
      },
      statusCode: 200
    })

    cy.get('*[data-cy="action-list-item"]').eq(3).click()
    cy.wait(500)

    cy.get('input[placeholder="Rechercher un navire..."]').clear().type('phe')
    cy.contains('mark', 'PHE').click()

    cy.get('[aria-label="Supprimer cette zone"]').click()

    cy.wait(250)
    cy.get('.Toastify__toast--success').should('not.exist')
  })

  /**
   * Non-regression test to prevent the modal to be showed when an action is created.
   * The `isDirty` field was not reset after a POST request.
   */
  it('Should not show an unsaved modal confirmation When an action is created', () => {
    // Given
    editSideWindowMissionListMissionWithId(34, SeafrontGroup.MEMN)
    cy.intercept('POST', '/api/v1/missions/34', {
      body: {
        id: 1
      },
      statusCode: 201
    })
    cy.intercept('DELETE', '/bff/v1/mission_actions/*', {
      body: {
        id: 2
      },
      statusCode: 200
    })
    cy.intercept('POST', '/bff/v1/mission_actions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateAction')
    cy.clickButton('Supprimer l’action')
    cy.wait(500)

    // When
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle à la débarque')

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno').wait(250)
    cy.contains('mark', 'PHENO').click()
    cy.get('#port').parent().click({ force: true })
    cy.get('.rs-search-box-input').type('saintmalo{enter}', { force: true })
    // Should select the right port
    cy.get('.Field-Select').contains('Saint-Malo (FRSML)')
    cy.fill('Saisi par', 'Marlin')
    cy.wait('@updateAction')
    cy.wait(500)

    // Then
    cy.clickButton('Fermer')
    cy.get('.Component-Dialog').should('not.exist')
  })

  it('Should not disable the "Enregistrer" button When the mission is valid but incomplete', () => {
    // Given
    openSideWindowMissionList()
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.MED}`).click()
    cy.fill('Statut de mission', undefined)
    cy.fill('Etat des données', ['À compléter'])
    cy.get('.Table').find(`.TableBodyRow[data-id="43"]`).clickButton('Éditer la mission')

    cy.get('[id="mission_control_unit_administration_0"]').contains('DREAL')
    cy.get('[id="mission_control_unit_name_0"]').contains('DREAL Pays-de-La-Loire')
    cy.clickButton('Supprimer l’action')
    cy.wait(500)
    cy.get('button:contains("Enregistrer")').should('not.be.disabled')

    // When, we add an incomplete control
    cy.fill('Types de mission', ['Air'])
    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle aérien')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()
    const dateTime = getUtcDateInMultipleFormats('2023-03-06T23:59:59Z')
    cy.fill('Date et heure du contrôle', dateTime.utcDateTupleWithTime)

    cy.get('button:contains("Enregistrer")').should('be.disabled')

    cy.fill('Saisi par', 'Marlin')

    // Then, the form is valid but incomplete (the completed by field is missing)
    cy.get('button:contains("Enregistrer")').should('not.be.disabled')
  })
})
