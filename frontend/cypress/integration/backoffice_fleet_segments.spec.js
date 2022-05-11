/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Fleet segments', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.intercept('GET', `/bff/v1/fleet_segments`).as('fleetSegments')
    cy.visit(`http://localhost:${port}/backoffice/fleet_segments`)
    cy.wait('@fleetSegments')
  })

  it('Should render the fleet segments', () => {
    // Then
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('.rs-table-cell-content').eq(8).children().should('have.value', '1.7')
    cy.get('.rs-table-cell-content').eq(9).children().should('have.value', 'ATL01')
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', 'All Trawls 3')
    cy.get('.rs-table-cell-content').eq(11).contains('OTM')
    cy.get('.rs-table-cell-content').eq(11).contains('PTM')
    cy.get('.rs-table-cell-content').eq(12).contains('BFT')
    cy.get('.rs-table-cell-content').eq(14).contains('27.7')
    cy.get('.rs-table-cell-content').eq(14).contains('27.8')
    cy.get('.rs-table-cell-content').eq(14).contains('27.9')
    cy.get('.rs-table-cell-content').eq(14).contains('27.10')
  })

  it('Should update the impact factor field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL01').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(8).children().type('{backspace}{backspace}')
    cy.get('.rs-table-cell-content').eq(8).children().type('.9')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(8).children().should('have.value', '1.9')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit(`http://localhost:${port}/backoffice/fleet_segments`)
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(8).children().should('have.value', '1.9')
  })

  it('Should update the segment field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL03').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(9).children().type('{backspace}')
    cy.get('.rs-table-cell-content').eq(9).children().type('3')
    cy.get('.rs-table-cell-content').eq(9).children().type('6')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(9).children().should('have.value', 'ATL036')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit(`http://localhost:${port}/backoffice/fleet_segments`)
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(9).children().should('have.value', 'ATL036')
  })

  it('Should update the segment name field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL01').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(10).children().type('{backspace}')
    cy.get('.rs-table-cell-content').eq(10).children().type('45')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', 'All Trawls 45')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit(`http://localhost:${port}/backoffice/fleet_segments`)
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', 'All Trawls 45')
  })

  it('Should update the gears field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL01').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(11).click()
    cy.get('[data-key="MSP"]').click()
    cy.get('[data-key="NO"]').click()

    cy.wait('@updateFleetSegment')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).contains('OTM')
    cy.get('.rs-table-cell-content').eq(11).contains('PTM')
    cy.get('.rs-table-cell-content').eq(11).contains('MSP')
    cy.get('.rs-table-cell-content').eq(11).contains('NO')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit(`http://localhost:${port}/backoffice/fleet_segments`)
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).contains('OTM')
    cy.get('.rs-table-cell-content').eq(11).contains('PTM')
    cy.get('.rs-table-cell-content').eq(11).contains('MSP')
    cy.get('.rs-table-cell-content').eq(11).contains('NO')
  })

  it.skip('Should delete an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 57)
    cy.intercept('DELETE', '/bff/v1/control_objectives/78').as('deleteObjective')

    // When
    cy.get('*[data-cy="delete-control-objective-78"]')
      .click()
    cy.wait('@deleteObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 56)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 56)
    cy.get('*[data-cy="delete-control-objective-78"]').should('not.exist')
  })

})
