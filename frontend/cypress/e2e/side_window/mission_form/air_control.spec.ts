import { Mission } from '@features/Mission/mission.types'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Air Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle aérien')
  })

  it('Should fill the form and send the expected data to the API', () => {
    cy.getDataCy('action-completion-status').contains('3 champs nécessaires aux statistiques à compléter')
    cy.getDataCy('action-contains-missing-fields').should('exist')

    const now = getUtcDateInMultipleFormats()
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

    // TODO Handle Automplete in custom `cy.fill()` command once it's used via monitor-ui.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    // Date et heure du contrôle
    cy.fill('Date et heure du contrôle', now.utcDateTupleWithTime)

    // The "Lieu du contrôle" field is stubbed in FormikCoordinatesPicker

    // Infractions
    cy.clickButton('Ajouter une infraction')
    cy.fill('Résultat de l’infraction', 'Avec PV')
    cy.fill('Catégorie d’infraction', 'Autre infraction')
    cy.fill('NATINF', '23581')
    cy.fill('Observations sur l’infraction', 'Une observation sur l’infraction.')
    cy.clickButton('Valider l’infraction')

    // Autres observations
    cy.fill('Autres observations', 'Une autre observation.')

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // Complété par
    cy.fill('Complété par', 'Alice', { index: 1 })

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@updateMissionAction',
      {
        body: {
          actionType: 'AIR_CONTROL',
          completedBy: 'Alice',
          controlQualityComments: null,
          controlUnits: [],
          districtCode: 'AY',
          emitsAis: null,
          emitsVms: null,
          externalReferenceNumber: 'DONTSINK',
          facade: null,
          feedbackSheetRequired: null,
          flagState: 'FR',
          gearInfractions: [],
          gearOnboard: [],
          id: 2,
          internalReferenceNumber: 'FAK000999999',
          ircs: 'CALLME',
          latitude: 47.084,
          licencesAndLogbookObservations: null,
          licencesMatchActivity: null,
          logbookInfractions: [],
          logbookMatchesActivity: null,
          longitude: -3.872,
          missionId: 1,
          numberOfVesselsFlownOver: null,
          otherComments: 'Une autre observation.',
          otherInfractions: [
            { comments: 'Une observation sur l’infraction.', infractionType: 'WITH_RECORD', natinf: 23581 }
          ],
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
          vesselId: 1,
          vesselName: 'PHENOMENE',
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
