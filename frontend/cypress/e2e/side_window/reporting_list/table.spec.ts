import { RTK_MAX_RETRIES } from '@api/constants'

import { openSideWindowReportingList } from './utils'
import { SeafrontGroup } from '../../../../src/constants/seafront'

context('Side Window > Reporting List > Table', () => {
  const failedQueryCount = RTK_MAX_RETRIES + 1
  const apiPathBase = '/bff/v1/reportings'

  it('Should filter reportings by vessel name (search input)', () => {
    /**
     * Should handle fetching error as expected
     */

    cy.intercept(
      {
        method: 'GET',
        times: failedQueryCount,
        url: apiPathBase
      },
      {
        statusCode: 400
      }
    ).as('getReportingsWithError')

    openSideWindowReportingList()
    cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()

    for (let i = 1; i <= failedQueryCount; i += 1) {
      cy.wait('@getReportingsWithError')
    }

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
     * Sort reporting table by date
     */

    cy.get('.Table-SimpleTable tr').eq(1).contains('3 milles - Chaluts')

    cy.get('th > div').filter(':contains("Il y a...")').click()

    cy.get('.Table-SimpleTable tr').eq(1).contains("Suspicion d'infraction 212")
  })
})
