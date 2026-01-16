import {openSideWindowAlertList} from './utils'
import {getUtcDateInMultipleFormats} from '../../utils/getUtcDateInMultipleFormats'

context('Side Window > Alert List', () => {
  beforeEach(() => {
    openSideWindowAlertList()

    /**
     * /!\ We need to use `function` and not arrow functions
     * https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Avoiding-the-use-of-this
     */

    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    // https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Sharing-Context
    cy.get('*[data-cy="side-window-silenced-alerts-list"]').children().eq(1).children().as('previousSilencedAlerts')
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    // https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Sharing-Context
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').as('previousAlerts')
  })

  it('Alert list display, navigation, search, filtering and expandable rows', () => {
    /**
     * Going to beacon malfunction then back in alerts Should not throw an exception
     */
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('[data-cy="side-window-menu-beacon-malfunctions"]').click()
    cy.get('[data-cy="side-window-menu-alerts"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').should('have.css', 'background', 'rgb(204, 207, 214)')

    /**
     * Sub menu "Hors f." should be found
     */
    cy.get('[data-cy="side-window-sub-menu-NONE"]').click()
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', 1)

    /**
     * Alerts Should be filtered based on the search input
     */
    cy.get('*[data-cy="side-window-sub-menu-SA"]').click()
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', 3)
    cy.fill('Rechercher un navire ou une alerte', 'YHIZ')
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', 1)
    cy.fill('Rechercher un navire ou une alerte', undefined)

    /**
     * Ten alerts Should be shown When clicking on the NAMO menu
     */
    // When
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()

    // Then
    cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains('10')
    cy.get('body').contains(
      '2 suspensions d\'alertes en NAMO'
    )
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', 10)

    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').last().should('contain', 'Chalutage dans les 3 milles')
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').last().should('contain', 'LE b@TO')
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').last().should('contain', '7059')

    /**
     * Test row expansion and collapse
     */
    // Get the first alert row
    cy.fill('Rechercher un navire ou une alerte', 'MRCP')
    cy.get('[title="Pêche en ZEE française par un navire tiers"]').click({ force: true })

    cy.get(`[data-id="15-expanded"]`).should('be.visible')

    cy.get(`[data-id="15-expanded"]`).should('contain', 'ABC000118343')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'MRCP')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'TO598604')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'Pour tous les navires tiers en pêche en ZEE française.')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'Les positions en pêche uniquement')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'Activités INN')
    cy.get(`[data-id="15-expanded"]`).should('contain', 'Pêche sans autorisation par navire tiers')
    cy.get(`[data-id="15-expanded"]`).should('contain', '2608')
    cy.get('[title="Pêche en ZEE française par un navire tiers"]').click({ force: true })

    // Verify expanded content is hidden
    cy.get(`[data-id="15-expanded"]`).should('not.exist')

    /**
     * Test expansion with specific alert after search
     */
    cy.fill('Rechercher un navire ou une alerte', 'PHENOMENE')

    /**
     * Show vessel on map
     */
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS&vesselId=&vesselIdentifier=INTERNAL_REFERENCE_NUMBER'
    ).as('showVesselPositionsOnMap')
    cy.get('[title="Voir sur la carte"]').first().forceClick()
    cy.wait('@showVesselPositionsOnMap').then(({ response }) => expect(response && response.statusCode).equal(200))
  })

  it('Alert validation and silencing', function () {
    /**
     * Test alert validation
     */
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    const expectedAlertsAfterValidation = this.previousAlerts.length - 1
    const previousSilencedAlerts = this.previousSilencedAlerts.length

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/1/validate').as('validateAlert')
    cy.get('[title="Valider l\'alerte"]').first().click({ force: true })
    cy.get('.Component-Banner').contains("Alerte validée et ajoutée à la fiche du navire")
    cy.wait('@validateAlert').then(({ response }) => expect(response && response.statusCode).equal(200))

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', expectedAlertsAfterValidation)
    // As the alert is validated, it will be silenced for 4 hours but not shown in the silenced alerts table
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', previousSilencedAlerts)

    /**
     * Test alert silencing
     */
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    const expectedSilencedAlerts = previousSilencedAlerts + 1
    const expectedAlertsAfterSilencing = expectedAlertsAfterValidation - 1

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/2/silence').as('silenceAlert')
    cy.get('[title="Suspendre l\'alerte"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-silence-alert-one-hour"]').first().click({ force: true })
    cy.get('.Component-Banner').contains("L'alerte sera suspendue pendant 1 heure")
    cy.wait('@silenceAlert').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', expectedSilencedAlerts)

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.wait(200)
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy="side-window-alerts-list"] tbody tr').should('have.length', expectedAlertsAfterSilencing)
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', expectedSilencedAlerts)
  })

  it('Creating new silenced alerts', function () {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()

    const now = getUtcDateInMultipleFormats('2066-06-08T13:54')
    const expectedSilencedAlerts = this.previousSilencedAlerts.length + 1

    cy.intercept('POST', '/bff/v1/operational_alerts/silenced').as('createSilenceAlert')

    // When
    cy.clickButton('Ajouter une nouvelle suspension')

    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()

    cy.fill('Alerte suspendue', 'ZEE')

    cy.fill('Date de reprise', now.utcDateTuple)

    cy.clickButton('Enregistrer')

    cy.wait('@createSilenceAlert').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.silencedBeforeDate)
      assert.deepInclude(interception.request.body, {
        externalReferenceNumber: 'DONTSINK',
        flagState: 'FR',
        internalReferenceNumber: 'FAK000999999',
        ircs: 'CALLME',
        value: '{"alertId":4,"name":"Pêche en ZEE française par un navire tiers","natinfCode":2608,"threat":"Activités INN","threatCharacterization":"Pêche sans autorisation par navire tiers","type":"POSITION_ALERT"}',
        vesselId: 1,
        vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
        vesselName: 'PHENOMENE'
      })
    })
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', expectedSilencedAlerts)

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.wait(200)
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', expectedSilencedAlerts)
  })
})
