import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Mission Form > Air Control', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter un contrôle aérien')
  })

  it('Should fill the form and send the expected data to the API', () => {
    const now = getUtcDateInMultipleFormats()
    cy.intercept('POST', '/bff/v1/mission_actions').as('createMissionAction')

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

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')

    cy.wait(500)

    // -------------------------------------------------------------------------
    // Request

    cy.waitForLastRequest(
      '@createMissionAction',
      {
        body: {
          actionType: 'AIR_CONTROL',
          closedBy: 'Alice',
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
          id: null,
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
  })

  it('Should only close mission once the form closure validation has passed', () => {
    const getCloseButton = () => cy.get('button').contains('Clôturer').parent()

    // -------------------------------------------------------------------------
    // Form Live Validation

    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('exist')
    cy.contains('Veuillez indiquer le navire contrôlé.').should('exist')
    cy.contains('Veuillez indiquer votre trigramme dans "Saisi par".').should('exist')

    cy.contains('Veuillez corriger les éléments en rouge').should('exist')
    getCloseButton().should('be.disabled')

    // Navire
    cy.get('input[placeholder="Rechercher un navire..."]').type('mal')
    cy.contains('mark', 'MAL').click().wait(500)
    cy.contains('Veuillez indiquer le navire contrôlé.').should('not.exist')

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
    cy.contains('Ré-ouvrir la mission').should('not.exist')

    // Clôturé par
    // TODO Handle multiple inputs with same label via an `index` in monitor-ui.
    cy.get('[name="closedBy"]').eq(1).type('Alice')
    cy.contains('Veuillez indiquer votre trigramme dans "Clôturé par".').should('not.exist')

    // Mission is now valid for closure
    cy.contains('Veuillez compléter les champs manquants dans cette action de contrôle.').should('not.exist')
    cy.contains('Veuillez corriger les éléments en rouge').should('not.exist')

    cy.wait(500)
    cy.clickButton('Clôturer')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
