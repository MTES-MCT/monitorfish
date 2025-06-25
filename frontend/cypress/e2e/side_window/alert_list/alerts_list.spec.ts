import { openSideWindowAlertList } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

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
    cy.get('*[data-cy="side-window-alerts-list"]').children().eq(1).children().as('previousAlerts')
  })

  it('Ten alerts Should be shown When clicking on the NAMO menu', () => {
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
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 1)

    /**
     * Alerts Should be filtered based on the search input
     */
    cy.get('*[data-cy="side-window-sub-menu-SA"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 3)
    cy.get('*[data-cy^="side-window-alerts-search-vessel"]').type('ABC0003')
    cy.get('*[data-cy^="side-window-alerts-list"]').children().should('have.length', 2)
    cy.get('*[data-cy^="side-window-alerts-search-vessel"]').clear()

    /**
     * Ten alerts Should be shown When clicking on the NAMO menu
     */
    // When
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()

    // Then
    cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains('10')
    cy.get('*[data-cy^="side-window-alerts-number-silenced-vessels"]').contains(
      'Suspension d’alerte sur 2 navires en NAMO'
    )
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', 10)

    cy.get(':nth-child(10)').contains('Chalutage dans les 3 milles')
    cy.get(':nth-child(10)').contains('LE b@TO')
    cy.get(':nth-child(10)').contains('7059')

    // Show vessel on map
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS&vesselId=&vesselIdentifier=INTERNAL_REFERENCE_NUMBER'
    ).as('showVesselPositionsOnMap')
    cy.get('*[data-cy="side-window-alerts-show-vessel"]').first().forceClick()
    cy.wait('@showVesselPositionsOnMap').then(({ response }) => expect(response && response.statusCode).equal(200))
  })

  it('An useCases Should be validated', function () {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    const expectedAlerts = this.previousAlerts.length - 1
    const previousSilencedAlerts = this.previousSilencedAlerts.length

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/1/validate').as('validateAlert')
    cy.get('*[data-cy="side-window-alerts-validate-alert"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-alerts-is-validated-transition"]').should('be.visible')
    cy.wait('@validateAlert').then(({ response }) => expect(response && response.statusCode).equal(200))

    // The value is saved in database when I refresh the page
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy^="side-window-alerts-list"]').children().eq(1).children().should('have.length', expectedAlerts)
    // As the useCases is validated, it will be silenced for 4 hours but not shown in the silenced alerts table
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', previousSilencedAlerts)
  })

  it('An useCases Should be silenced', function () {
    // Given
    cy.get('*[data-cy="side-window-sub-menu-NAMO"]').click()
    const expectedSilencedAlerts = this.previousSilencedAlerts.length + 1

    // When
    cy.intercept('PUT', '/bff/v1/operational_alerts/2/silence').as('silenceAlert')
    cy.get('*[data-cy="side-window-alerts-silence-alert"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-silence-alert-one-hour"]').first().click({ force: true })
    cy.get('*[data-cy="side-window-alerts-is-silenced-transition"]').should('be.visible')
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
    cy.get('*[data-cy^="side-window-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', this.previousAlerts.length - 1)
    cy.get('*[data-cy="side-window-sub-menu-SUSPENDED_ALERTS"]').click()
    cy.get('*[data-cy^="side-window-silenced-alerts-list"]')
      .children()
      .eq(1)
      .children()
      .should('have.length', expectedSilencedAlerts)
  })

  it('A silenced useCases Should be created', function () {
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
        value: '{"type":"FRENCH_EEZ_FISHING_ALERT"}',
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
