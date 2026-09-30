import { SeafrontGroup } from '@constants/seafront'

import { stubSideWindowOptions } from '../../support/commands'

const ONE_ZONE = /^MULTIPOLYGON\(\(\([^()]*\)\)\)$/
const TWO_ZONES = /^MULTIPOLYGON\(\(\([^()]*\)\),\(\([^()]*\)\)\)$/

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
      pathname: '/bff/v1/reportings/display',
      query: { isArchived: 'true', origin: 'ALERT', zone: ONE_ZONE }
    }).as('displayArchivedAlertReportingsInZone')
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings/display',
      query: { isArchived: 'true', origin: 'ALERT', zone: TWO_ZONES }
    }).as('displayArchivedAlertReportingsInTwoZones')
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings',
      query: { isArchived: 'true', origin: 'ALERT', seafrontGroup: SeafrontGroup.NAMO, zone: TWO_ZONES }
    }).as('getArchivedAlertReportingsInTwoZones')

    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // When
    cy.fill('Statut', 'Archivé')
    cy.wait('@displayArchivedReportings')

    cy.fill('Source', 'Alerte auto.')
    cy.wait('@displayArchivedAlertReportings')

    cy.clickButton('Définir une zone de filtre manuelle')
    cy.get('body').click(490, 580)
    cy.get('body').click(420, 635)
    cy.get('body').dblclick(560, 620)
    cy.clickButton('Valider la zone de filtre')
    cy.wait('@displayArchivedAlertReportingsInZone')

    cy.get('*[data-cy="reporting-map-menu-box"]').within(() => {
      cy.contains('Zone de filtre 1').should('be.visible')
      cy.contains('button', 'Définir une zone de filtre manuelle').should('not.be.disabled')
    })

    cy.clickButton('Définir une zone de filtre manuelle')
    cy.get('body').click(620, 580)
    cy.get('body').click(580, 650)
    cy.get('body').dblclick(700, 630)
    cy.clickButton('Valider la zone de filtre')
    cy.wait('@displayArchivedAlertReportingsInTwoZones')

    cy.get('*[data-cy="reporting-map-menu-box"]').within(() => {
      cy.contains('Zone de filtre 1').should('be.visible')
      cy.contains('Zone de filtre 2').should('be.visible')
    })

    cy.clickButton('Voir la vue détaillée des signalements')
    cy.wait(1000)
    cy.getDataCy('side-window-reporting-tab').click({ force: true })
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click({ force: true })

    // Then the list queries with the very filters set on the map side...
    cy.wait('@getArchivedAlertReportingsInTwoZones')

    // ...and shows them as its own selected values.
    cy.get('*[data-cy="reporting-table-filters"]').should('exist')
    cy.get('*[data-cy="reporting-table-filters"]').contains('Zone de filtre 1').should('be.visible')
    cy.get('*[data-cy="reporting-table-filters"]').contains('Zone de filtre 2').should('be.visible')

    // When one zone is removed from the list
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings',
      query: { isArchived: 'true', origin: 'ALERT', seafrontGroup: SeafrontGroup.NAMO, zone: ONE_ZONE }
    }).as('getArchivedAlertReportingsInZone')
    cy.get('*[data-cy="reporting-table-filters"]')
      .contains('.Component-SingleTag', 'Zone de filtre 1')
      .find('[aria-label="Supprimer ce tag"]')
      .click({ force: true })

    // Then only the other zone is kept
    cy.wait('@getArchivedAlertReportingsInZone')
    cy.get('*[data-cy="reporting-table-filters"]').within(() => {
      cy.contains('Zone de filtre 1').should('be.visible')
      cy.contains('Zone de filtre 2').should('not.exist')
    })

    // When the last zone is removed from the list
    // Intercepted only now, so that the request awaited is the one sent without the zone.
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings',
      query: { isArchived: 'true', origin: 'ALERT', seafrontGroup: SeafrontGroup.NAMO }
    }).as('getArchivedAlertReportings')
    cy.get('*[data-cy="reporting-table-filters"]')
      .contains('.Component-SingleTag', 'Zone de filtre 1')
      .find('[aria-label="Supprimer ce tag"]')
      .click({ force: true })

    // Then
    cy.wait('@getArchivedAlertReportings').its('request.query').should('not.have.property', 'zone')
    cy.get('*[data-cy="reporting-table-filters"]').within(() => {
      cy.contains('Zone de filtre 1').should('not.exist')
    })
    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.getDataCy('ReportingTable-reporting').each($row => {
      cy.wrap($row).contains('Archivé')
    })
  })
})
