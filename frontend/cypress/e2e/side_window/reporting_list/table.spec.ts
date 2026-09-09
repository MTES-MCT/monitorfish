import { RTK_MAX_RETRIES } from '@api/constants'

import { SeafrontGroup } from '../../../../src/constants/seafront'

context('Side Window > Reporting List > Table', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  // The list is paginated and filtered server-side, so every request carries query params.
  const apiPath = '/bff/v1/reportings?*'
  const absentVesselPath = '/bff/v1/reportings?absentVessel=true*'

  it('Should filter reportings by vessel name (search input)', () => {
    cy.login('superuser')

    /**
     * Should handle fetching error as expected
     */

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

    // The error state (and its "Réessayer" button) can render a beat after the last failed query
    // settles. Wait for the button before clicking so we don't race the error UI.
    cy.contains('button', 'Réessayer', { timeout: 20000 }).should('be.visible')
    cy.clickButton('Réessayer')

    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 3)

    /**
     * Search a vessel
     */

    cy.fill('Rechercher dans les signalements', 'renco')
    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 2)

    cy.fill('Rechercher dans les signalements', '')
    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 3)

    /**
     * Filter by observation
     */

    cy.fill('Type de signalement', 'Observation')
    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 2)

    cy.fill('Type de signalement', undefined)
    cy.wait('@getReportings')

    /**
     * Filter by absent vessel
     */

    cy.intercept('GET', absentVesselPath).as('getAbsentVesselReportings')
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.OUTREMEROA}`).click()
    cy.fill('Navires sans fiche', true)

    cy.wait('@getAbsentVesselReportings')

    cy.get('tbody').contains('Aucun signalement')

    cy.fill('Navires sans fiche', false)
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()
    cy.wait('@getReportings')

    /**
     * Sort reporting table by date
     */

    cy.get('th > div').filter(':contains("Date début")').click({ force: true })
    cy.wait('@getReportings').its('request.url').should('contain', 'sortColumn=REPORTING_DATE')
  })

  it('Should show archived reportings and load the next page', () => {
    const apiPathAlias = '/bff/v1/reportings?*'

    cy.login('superuser')
    cy.intercept('GET', apiPathAlias).as('getReportings')

    cy.visit('/side_window')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.wait('@getReportings')

    /**
     * Archived reportings are excluded when the status filter is set to "En cours"...
     */

    cy.fill('Statut', 'En cours')
    cy.wait('@getReportings').its('request.url').should('contain', 'isArchived=false')

    cy.get('tbody').should('not.contain', 'Archivé')

    /**
     * ...and are the only ones left when it is set to "Archivé".
     */

    cy.fill('Statut', 'Archivé')
    cy.wait('@getReportings').its('request.url').should('contain', 'isArchived=true')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.get('tbody').should('not.contain', 'En cours')

    /**
     * The list loads 50 reportings at a time.
     */

    cy.fill('Statut', undefined)
    cy.wait('@getReportings')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 50)

    cy.clickButton('Charger les 50 signalements suivants')
    cy.wait('@getReportings').its('request.url').should('contain', 'pageSize=100')

    cy.getDataCy('ReportingTable-reporting').should('have.length', 100)
  })

  it('Should filter reportings by source', () => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings?*').as('getReportings')

    cy.visit('/side_window')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()
    cy.wait('@getReportings')

    cy.fill('Source', 'Alerte auto.')
    cy.wait('@getReportings').its('request.url').should('contain', 'origin=ALERT')

    cy.getDataCy('ReportingTable-reporting').should('have.length.to.be.greaterThan', 0)
    cy.get('tbody').should('not.contain', 'Pôle OPS')
  })
})
