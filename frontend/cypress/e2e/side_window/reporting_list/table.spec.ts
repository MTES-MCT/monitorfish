import {RTK_MAX_RETRIES} from '@api/constants'
import {SeafrontGroup} from '../../../../src/constants/seafront'

context('Side Window > Reporting List > Table', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const apiPathBase = '/bff/v1/reportings'

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
        url: apiPathBase
      },
      {
        statusCode: 400
      }
    ).as('getReportingsWithError')

    cy.visit('/side_window')
    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getReportingsWithError')
    }

    cy.wait(500)

    cy.getDataCy('side-window-reporting-tab').click()
    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getReportingsWithError')
    }

    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    cy.intercept('GET', apiPathBase).as('getReportings')

    cy.clickButton('Réessayer')

    cy.wait('@getReportings')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 3)

    /**
     * Search a vessel
     */

    cy.fill('Rechercher dans les signalements', 'renco')

    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.fill('Rechercher dans les signalements', '')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 3)

    /**
     * Filter by observation
     */

    cy.fill("Suspicions d'infraction", false)
    cy.fill('Observations', true)

    cy.get('.Table-SimpleTable tr').should('have.length', 3)
    cy.get('.Table-SimpleTable tr').eq(1).contains('Observation')
    cy.get('.Table-SimpleTable tr').eq(2).contains('Observation')

    cy.fill("Suspicions d'infraction", true)
    cy.fill('Observations', false)

    /**
     * Sort reporting table by date
     */

    cy.get('.Table-SimpleTable td').eq(5).then(firstRowText => {
      cy.get('.Table-SimpleTable tr').eq(1).contains(firstRowText.text())
    })

    cy.get('th > div').filter(':contains("Il y a...")').click({ force: true })

    cy.get('.Table-SimpleTable tr').eq(1).contains("Suspicion d'infraction 212")
  })
})
