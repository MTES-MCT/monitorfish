import { SeafrontGroup } from '@constants/seafront'

import { stubSideWindowOptions } from '../../support/commands'

// `stubSideWindowOptions` makes the side window render in the same document instead of a real popup,
// so a single test can set a filter in the map menu and then observe the list querying with it.
context('Reportings filters are shared by the map and the list', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')

    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(1000)
  })

  it('Should apply the filters set in the map menu to the reporting list', () => {
    // Given
    // Each filter change is awaited on the request carrying it, as the map layer and the list both
    // query on their own as soon as the shared filters change.
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings/display',
      query: { isArchived: 'true' }
    }).as('displayArchivedReportings')
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings/display',
      query: { isArchived: 'true', origin: 'ALERT' }
    }).as('displayArchivedAlertReportings')
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings',
      query: { isArchived: 'true', origin: 'ALERT', seafrontGroup: SeafrontGroup.NAMO }
    }).as('getArchivedAlertReportings')

    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // When
    cy.fill('Statut', 'Archivé')
    cy.wait('@displayArchivedReportings')

    cy.fill('Source', 'Alerte auto.')
    cy.wait('@displayArchivedAlertReportings')

    cy.clickButton('Voir la vue détaillée des signalements')
    cy.wait(1000)
    cy.getDataCy('side-window-reporting-tab').click({ force: true })
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click({ force: true })

    // Then the list queries with the very filters set on the map side...
    cy.wait('@getArchivedAlertReportings')

    // ...and shows them as its own selected values.
    cy.get('*[data-cy="side-window-reporting-list"]').should('exist')
    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.getDataCy('ReportingTable-reporting').each($row => {
      cy.wrap($row).contains('Archivé')
    })
  })
})
