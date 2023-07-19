import { openSideWindowReportingList } from './utils'
import { SeaFrontGroup } from '../../../../src/domain/entities/seaFront/constants'

context('Side Window > Reporting List > Table', () => {
  beforeEach(() => {
    openSideWindowReportingList()

    cy.getDataCy(`side-window-sub-menu-${SeaFrontGroup.NAMO}`).click()
  })

  it('Should sort reportings by title', () => {
    // TODO Make a cypress helper to handle semantically-correct tables (via both `<table />` and roles).
    const getTitleColumnHeader = () => cy.get('[role="columnheader"]').contains('Titre')

    getTitleColumnHeader().click()

    getTitleColumnHeader().parent().find('svg').should('be.visible')
    cy.get('[role="table"] [role="rowgroup"]:last-child() [role="row"]').first().contains('3 milles - Chaluts')

    getTitleColumnHeader().click()

    getTitleColumnHeader().parent().find('svg').should('be.visible')
    cy.get('[role="table"] [role="rowgroup"]:last-child() [role="row"]')
      .first()
      .contains('Suspicion de chalutage dans les 3 milles')
  })

  it('Should sort reportings by NATINF', () => {
    const getNatinfColumnHeader = () => cy.get('[role="columnheader"]').contains('NATINF')

    getNatinfColumnHeader().click()

    getNatinfColumnHeader().parent().find('svg').should('be.visible')
    cy.get('[role="table"] [role="rowgroup"]:last-child() [role="row"]').first().contains('7059')

    getNatinfColumnHeader().click()

    getNatinfColumnHeader().parent().find('svg').should('be.visible')
    cy.get('[role="table"] [role="rowgroup"]:last-child() [role="row"]').first().contains('27689')
  })
})
