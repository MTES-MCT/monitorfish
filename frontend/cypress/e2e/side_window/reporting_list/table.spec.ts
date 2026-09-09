import { RTK_MAX_RETRIES } from '@api/constants'

import { SeafrontGroup } from '../../../../src/constants/seafront'

// The list is filtered and paginated server-side, and the map layer queries the same endpoint, so a
// request is awaited on the filters it carries rather than on its rank in the alias queue.
function interceptReportings(query: Record<string, string>, alias: string) {
  cy.intercept({ method: 'GET', pathname: '/bff/v1/reportings', query }).as(alias)
}

context('Side Window > Reporting List > Table', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const apiPath = '/bff/v1/reportings?*'

  it('Should filter reportings by vessel name (search input)', () => {
    cy.login('superuser')

    cy.wait(500)
    cy.intercept(
      {
        method: 'GET',
        times: failedQueryCount * 2,
        url: apiPath
      },
      {
        statusCode: 400
      }
    ).as('getReportingsWithError')

    cy.visit('/side_window')

    cy.wait(500)

    cy.getDataCy('side-window-reporting-tab').click()
    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getReportingsWithError')
    }

    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    cy.intercept('GET', apiPath).as('getReportings')
    interceptReportings({ searchQuery: 'renco' }, 'getSearchedReportings')
    interceptReportings({ reportingType: 'OBSERVATION' }, 'getObservationReportings')
    interceptReportings({ absentVessel: 'true' }, 'getAbsentVesselReportings')
    interceptReportings({ sortDirection: 'ASC' }, 'getAscendingReportings')

    // The error state (and its "Réessayer" button) can render a beat after the last failed query
    // settles. Wait for the button before clicking so we don't race the error UI.
    cy.contains('button', 'Réessayer', { timeout: 20000 }).should('be.visible')
    cy.clickButton('Réessayer')

    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 3)

    cy.fill('Rechercher dans les signalements', 'renco')
    cy.wait('@getSearchedReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 2)

    cy.fill('Rechercher dans les signalements', '')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 3)

    cy.fill('Type de signalement', 'Observation')
    cy.wait('@getObservationReportings')

    // The second NAMO observation is a year old, and the list defaults to the last 3 months.
    cy.getDataCy('ReportingTable-reporting').should('have.length', 1)

    cy.fill('Type de signalement', undefined)

    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.OUTREMEROA}`).click()
    cy.fill('Navires sans fiche', true)
    cy.wait('@getAbsentVesselReportings')

    cy.get('tbody').contains('Aucun signalement')

    cy.fill('Navires sans fiche', false)
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    cy.get('th > div').filter(':contains("Date début")').click({ force: true })
    cy.wait('@getAscendingReportings').its('request.url').should('contain', 'sortColumn=REPORTING_DATE')
  })

  it('Should filter reportings by status and source, and load the next page', () => {
    cy.login('superuser')

    cy.intercept('GET', apiPath).as('getReportings')
    interceptReportings({ isArchived: 'false' }, 'getCurrentReportings')
    interceptReportings({ isArchived: 'true' }, 'getArchivedReportings')
    interceptReportings({ pageSize: '100' }, 'getNextPageReportings')
    interceptReportings({ origin: 'ALERT' }, 'getAlertReportings')

    cy.visit('/side_window')
    cy.getDataCy('side-window-reporting-tab').click()
    // The only seafront group holding more than a page of reportings.
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.OUTREMEROA}`).click()
    cy.wait('@getReportings')

    cy.fill('Statut', 'En cours')
    cy.wait('@getCurrentReportings')

    cy.get('tbody').should('not.contain', 'Archivé')

    cy.fill('Statut', 'Archivé')
    cy.wait('@getArchivedReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.get('tbody').should('not.contain', 'En cours')

    cy.fill('Statut', undefined)

    cy.getDataCy('ReportingTable-reporting').should('have.length', 50)

    cy.clickButton('Charger les 50 signalements suivants')
    cy.wait('@getNextPageReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 100)

    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()
    cy.fill('Source', 'Alerte auto.')
    cy.wait('@getAlertReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.get('tbody').should('not.contain', 'Pôle OPS')
  })
})
