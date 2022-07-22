/* eslint-disable no-undef */
/// <reference types="cypress" />

context('Fleet segments', () => {
  beforeEach(() => {
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
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
    cy.visit('/backoffice/fleet_segments')
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
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(9).children().should('have.value', 'ATL036')
  })

  it('Should update the segment name field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL036').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(10).children().type('{backspace}')
    cy.get('.rs-table-cell-content').eq(10).children().type('45')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', 'All Trawls 45')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', 'All Trawls 45')
  })

  it('Should update the gears field', () => {
    // When
    cy.intercept('PUT', '/bff/v1/fleet_segments/ATL036').as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(11).click()
    cy.get('[data-key="MSP"]').scrollIntoView()
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
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).contains('OTM')
    cy.get('.rs-table-cell-content').eq(11).contains('PTM')
    cy.get('.rs-table-cell-content').eq(11).contains('MSP')
    cy.get('.rs-table-cell-content').eq(11).contains('NO')
  })

  it('Should delete a fleet segment', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 44)
    cy.intercept('DELETE', '/bff/v1/fleet_segments/ATL036').as('deleteFleetSegment')

    // When
    cy.get('*[data-cy="delete-row-ATL036"]')
      .click({ force: true })
    cy.wait('@deleteFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 43)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 43)
    cy.get('*[data-cy="delete-row-ATL036"]').should('not.exist')
  })

  it('Should create a fleet segment', () => {
    // Given
    cy.get('[role="row"]').should('have.length', 43)
    cy.intercept('POST', '/bff/v1/fleet_segments').as('createFleetSegment')

    // When
    cy.clickLink('Ajouter un segment')
    cy.wait(1000)

    cy.fill('Nom', 'SEGMENT007')
    cy.fill('Note d’impact', '2.7')
    cy.fill('Description', 'Malotru’s segment')

    cy.get('[data-cy="create-fleet-segment-gears"]').click({ force: true })
    cy.get('[data-key="DHS"]').click()
    cy.get('[data-key="FCN"]').click()

    cy.get('[data-cy="create-fleet-segment-targeted-species"]').click({ force: true })
    cy.get('[data-cy="create-fleet-segment-targeted-species"] input').type('COD', { force: true })
    cy.get('[data-key="COD"]').click()
    cy.get('[data-cy="create-fleet-segment-targeted-species"] input').type('SOL', { force: true })
    cy.get('[data-key="SOL"]').click()

    // TODO Investigate why this is not working
    // cy.get('[data-cy="create-fleet-segment-incidental-species"]').click({ force: true })
    // cy.get('[data-cy="create-fleet-segment-incidental-species"] input').type('ANE', { force: true })
    // cy.get('[data-key="ANE"]').click()

    cy.get(':nth-child(9) > .rs-picker-tag-wrapper > .rs-picker-search > .rs-picker-search-input > input')
      .type('BF', { force: true })
    cy.get('[data-key="BFT"]').click()

    cy.get('*[data-cy="create-fleet-segment-fao-zones"]').click({ force: true })
    cy.get('[data-key="21.1.A"]').click()
    cy.get('[data-key="21.1.B"]').click()

    cy.get('*[data-cy="create-fleet-segment"]').click()
    cy.wait('@createFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[title="SEGMENT007"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('*[data-cy="delete-row-SEGMENT007"]').should('exist')
    cy.get('[title="Malotru’s segment"] > .rs-table-cell-content > .rs-input').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/fleet_segments').as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[title="SEGMENT007"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('[title="Malotru’s segment"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('*[data-cy="delete-row-SEGMENT007"]').should('exist')
  })
})
