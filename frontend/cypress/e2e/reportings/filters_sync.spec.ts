import { SeafrontGroup } from '@constants/seafront'

import { stubSideWindowOptions } from '../../support/commands'

// `stubSideWindowOptions` makes the side window render in the same document instead of a real popup,
// so a single test can set a filter in the map menu and then observe the list querying with it.
context('Reportings filters are shared by the map and the list', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.intercept('GET', '/bff/v1/reportings?*').as('getReportings')

    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(1000)
  })

  it('Should apply the filters set in the map menu to the reporting list', () => {
    // Given
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // When
    cy.fill('Statut', 'Archivé')
    cy.wait('@displayReportings').its('request.url').should('contain', 'isArchived=true')

    cy.fill('Source', 'Alerte auto.')
    cy.wait('@displayReportings').its('request.url').should('contain', 'origin=ALERT')

    cy.clickButton('Voir la vue détaillée des signalements')
    cy.wait(1000)
    cy.getDataCy('side-window-reporting-tab').click({ force: true })
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click({ force: true })

    // Then the list queries with the very filters set on the map side...
    cy.wait('@getReportings').then(({ request }) => {
      expect(request.url).to.contain('isArchived=true')
      expect(request.url).to.contain('origin=ALERT')
      expect(request.url).to.contain(`seafrontGroup=${SeafrontGroup.NAMO}`)
    })

    // ...and shows them as its own selected values.
    cy.get('*[data-cy="side-window-reporting-list"]').should('exist')
    cy.getDataCy('ReportingTable-reporting').each($row => {
      cy.wrap($row).contains('Archivé')
    })
  })
})
