import { SeafrontGroup } from '../../../../src/constants/seafront'

context('Side Window > Reporting List > Table', () => {
  const apiPathBase = '/bff/v1/reportings'
  const absentVesselPath = `${apiPathBase}?absentVessel=true`
  // Matches only the base reportings request (no query string), so it never captures the
  // `?absentVessel=true` request handled later in this test.
  const baseReportingsUrl = /\/bff\/v1\/reportings$/

  it('Should filter reportings by vessel name (search input)', () => {
    cy.login('superuser')

    /**
     * Should handle fetching error as expected
     */

    // Force every reportings fetch to fail so the error state (and its "Réessayer" button) is
    // guaranteed to render, no matter how many times RTK Query refetches. The previous approach
    // capped failures at an exact `times` budget; any extra refetch overshot it, let a real
    // response through and cleared the error before we could assert the button — the main flake.
    let shouldFail = true
    cy.intercept({ method: 'GET', url: baseReportingsUrl }, req => {
      if (shouldFail) {
        req.reply({ statusCode: 400 })

        return
      }

      req.continue()
    }).as('getReportingsWithError')

    cy.visit('/side_window')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    cy.contains('button', 'Réessayer', { timeout: 20000 }).should('be.visible')

    cy.intercept('GET', apiPathBase).as('getReportings')

    // Let the retry reach the real backend, then wait for the table to actually populate before
    // asserting counts, so the client-side filters below run against fully loaded data.
    cy.then(() => {
      shouldFail = false
    })
    cy.clickButton('Réessayer')

    cy.get('.Table-SimpleTable tr', { timeout: 20000 }).should('have.length.to.be.greaterThan', 4)

    /**
     * Search a vessel
     */

    cy.fill('Rechercher dans les signalements', 'renco')

    cy.get('.Table-SimpleTable tr').should('have.length', 3)

    cy.fill('Rechercher dans les signalements', '')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 4)

    /**
     * Filter by observation
     */

    cy.fill('Type de signalement', 'Observations')

    cy.get('.Table-SimpleTable tr').should('have.length', 3)
    cy.get('.Table-SimpleTable tr').eq(1).contains('Observation')
    cy.get('.Table-SimpleTable tr').eq(2).contains('Observation')

    cy.fill('Type de signalement', undefined)

    /**
     * Filter by absent vessel
     */

    cy.intercept('GET', absentVesselPath).as('getAbsentVesselReportings')
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.OUTREMEROA}`).click()
    cy.fill('Navires sans fiche', true)

    cy.wait('@getAbsentVesselReportings')

    cy.get('tbody').contains('Aucun signalement')
    cy.wait('@getReportings')

    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    /**
     * Sort reporting table by date
     */

    cy.get('.Table-SimpleTable td')
      .eq(5)
      .then(firstRowText => {
        cy.get('.Table-SimpleTable tr').eq(1).contains(firstRowText.text())
      })

    cy.get('th > div').filter(':contains("Depuis...")').click({ force: true })

    cy.get('.Table-SimpleTable tr').eq(2).contains("Suspicion d'infraction 212")
  })
})
