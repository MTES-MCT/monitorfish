/* eslint-disable no-undef */

context('BackOffice > Control Objective Tables > Table', () => {
  beforeEach(() => {
    const currentYear = new Date().getFullYear()

    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.intercept('GET', `/bff/v1/admin/control_objectives/${currentYear}`).as('controlObjectives')

    cy.login('superuser')

    cy.visit('/backoffice/control_objectives')
    cy.wait('@fleetSegments')
    cy.wait('@controlObjectives')
  })

  it('Should render the objectives and navigate between years', () => {
    // Then
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('[data-cy="control-objective-facade-title"]').should('have.length', 5)
    cy.get('[data-cy="control-objective-facade-title"]').eq(0).contains('NORD ATLANTIQUE - MANCHE OUEST (NAMO)')
    cy.get('[data-cy="control-objective-facade-title"]').eq(1).contains('MANCHE EST – MER DU NORD (MEMN)')
    cy.get('[data-cy="control-objective-facade-title"]').eq(2).contains('SUD-ATLANTIQUE (SA)')
    cy.get('[data-cy="control-objective-facade-title"]').eq(3).contains('Méditerranée (MED)')
    cy.get('[data-cy="control-objective-facade-title"]').eq(4).contains('Corse (CORSE)')

    cy.get('.rs-table-cell-content').eq(9).contains('ATL01')
    // We check the next line as the ATL01 segment was deleted from the segment table and has no segment name associated
    cy.get('.rs-table-cell-content').eq(18).contains('Eel sea fisheries')
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '0')
    cy.get('.rs-table-cell-content').eq(12).children().should('have.value', '20')
    // We check the next line as the ATL01 segment was deleted from the segment table and has no impact risk factor associated
    cy.get('.rs-table-cell-content').eq(21).children().contains('3.8')
    cy.get('.rs-table-cell-content').eq(14).children().children().children().contains('1')

    const currentYear = new Date().getFullYear()
    cy.get('*[data-cy^="control-objectives-year"]').contains(currentYear)

    cy.log('Check the FR_SCE control objectives of MEMN')
    cy.get('[data-cy="row-68-targetNumberOfControlsAtPort"]').should('exist')
    cy.get('[data-cy="row-68-targetNumberOfControlsAtSea"]').should('exist')

    cy.log('Navigate to previous year')
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get(`[data-key="${currentYear - 1}"] > .rs-picker-select-menu-item`).click()
    cy.get('[data-cy="row-15-targetNumberOfControlsAtPort"]').should('exist')
    cy.get('[data-cy="row-15-targetNumberOfControlsAtSea"]').should('exist')
  })
})
