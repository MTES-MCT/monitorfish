/* eslint-disable no-undef */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const currentYear = dayjs().utc().year()
context('Fleet segments', () => {
  beforeEach(() => {
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(1000)
  })

  it('Should list, create, update and delete fleet segments', () => {
    // -------------------------------------------------------------------------
    cy.log('Should render the fleet segments')

    // Then
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[data-cy="row-ATL01-impactRiskFactor"]').contains(1.7)
    cy.get('[data-cy="row-ATL01-segment"]').should('have.value', 'ATL01')
    cy.get('[data-cy="row-ATL01-segmentName"]').should('have.value', 'All Trawls 3')
    cy.get('.rs-table-cell-content').eq(11).contains('OTM')
    cy.get('.rs-table-cell-content').eq(11).contains('PTM')
    cy.get('.rs-table-cell-content').eq(12).contains('BFT')
    cy.get('.rs-table-cell-content').eq(14).contains('27.7')
    cy.get('.rs-table-cell-content').eq(14).contains('27.8')
    cy.get('.rs-table-cell-content').eq(14).contains('27.9')
    cy.get('.rs-table-cell-content').eq(14).contains('27.10')

    // -------------------------------------------------------------------------
    cy.log('Should update the impact factor field')

    // When
    cy.intercept('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL01`).as('updateFleetSegment')
    cy.get('[data-cy="row-ATL01-impactRiskFactor"]').click()
    cy.get('[data-key="1.2"] > .rs-picker-select-menu-item').click()
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('[data-cy="row-ATL01-impactRiskFactor"]').contains(1.2)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('[data-cy="row-ATL01-impactRiskFactor"]').contains(1.2)

    // -------------------------------------------------------------------------
    cy.log('Should update the segment field')

    // When
    cy.intercept('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL01`).as('updateFleetSegment')
    cy.get('[data-cy="row-ATL01-segment"]').type('{backspace}')
    cy.wait(200)
    cy.get('[data-cy="row-ATL0-segment"]').type('3')
    cy.wait(200)
    cy.get('[data-cy="row-ATL03-segment"]').type('6')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('[data-cy="row-ATL036-segment"]').should('have.value', 'ATL036')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('[data-cy="row-ATL036-segment"]').should('have.value', 'ATL036')

    // Reset
    cy.request('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL036`, {
      segment: 'ATL01'
    })

    // -------------------------------------------------------------------------
    cy.log('Should update the segment name field')

    cy.visit('/backoffice/fleet_segments')

    // When
    cy.intercept('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL01`).as('updateFleetSegment')
    cy.get('[data-cy="row-ATL01-segmentName"]').type('{backspace}').wait(500)
    cy.get('[data-cy="row-ATL01-segmentName"]').type('4')
    cy.wait(200)
    cy.get('[data-cy="row-ATL01-segmentName"]').type('5')
    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('[data-cy="row-ATL01-segmentName"]').should('have.value', 'All Trawls 45')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('[data-cy="row-ATL01-segmentName"]').should('have.value', 'All Trawls 45')

    // Reset
    cy.request('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL01`, {
      segmentName: 'All Trawls 3'
    })

    // -------------------------------------------------------------------------
    cy.log('Should update the gears field')

    cy.visit('/backoffice/fleet_segments')

    // Given
    cy.intercept('PUT', `/bff/v1/fleet_segments?year=${currentYear}&segment=ATL01`).as('updateFleetSegment')
    cy.get('.rs-table-cell-content').eq(11).click()
    cy.wait(200)
    cy.get('.rs-table-cell-content')
      .eq(11)
      .then(content => {
        if (content.text().includes('OTM')) {
          cy.get('.rs-picker-search-input > input').type('OTM{enter}')
          cy.wait('@updateFleetSegment')
        }
      })
    cy.get('.rs-table-cell-content')
      .eq(11)
      .then(content => {
        if (content.text().includes('PTM')) {
          cy.get('.rs-picker-search-input > input').type('PTM{enter}')
          cy.wait('@updateFleetSegment')
        }
      })
    cy.get('.rs-table-cell-content')
      .eq(11)
      .then(content => {
        if (content.text().includes('MSP')) {
          cy.get('.rs-picker-search-input > input').type('MSP{enter}')
          cy.wait('@updateFleetSegment')
        }
      })
    cy.get('.rs-table-cell-content')
      .eq(11)
      .then(content => {
        if (content.text().includes('NO')) {
          cy.get('.rs-picker-search-input > input').type('NO{enter}')
          cy.wait('@updateFleetSegment')
        }
      })
    cy.wait(200)

    // When
    cy.get('.rs-picker-search-input > input').type('MSP{enter}')
    cy.wait(200)
    cy.get('.rs-picker-search-input > input').type('NO{enter}')

    cy.wait('@updateFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).contains('MSP')
    cy.get('.rs-table-cell-content').eq(11).contains('NO')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).contains('MSP')
    cy.get('.rs-table-cell-content').eq(11).contains('NO')

    // -------------------------------------------------------------------------
    cy.log('Should delete a fleet segment')

    // Given
    cy.get('.rs-table-row').should('have.length', 44)
    cy.intercept('DELETE', `/bff/v1/fleet_segments?year=${currentYear}&segment=FR_DRB`).as('deleteFleetSegment')

    // When
    cy.get('*[data-cy="delete-row-FR_DRB"]').click({ force: true })
    cy.wait('@deleteFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 43)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 43)
    cy.get('*[data-cy="delete-row-FR_DRB"]').should('not.exist')

    // -------------------------------------------------------------------------
    cy.log('Should create a fleet segment')

    // Given
    cy.get('[role="row"]').should('have.length', 43)
    cy.intercept('POST', '/bff/v1/fleet_segments').as('createFleetSegment')

    // When
    cy.clickLink('Ajouter un segment')
    cy.wait(1000)

    cy.fill('Nom', 'SEGMENT007')
    cy.fill('Note d’impact', '2.7')
    cy.fill('Description', 'Malotru’s segment')
    cy.fill('Engins', ['DHS', 'FCN'])
    cy.fill('Espèces ciblées', ['COD', 'SOL'])
    // TODO Investigate why this is not working.
    // cy.get('[data-key="ANE"]').click()
    // cy.fill('Prises accessoires', ['ANE', 'BFT'])
    cy.fill('Prises accessoires', ['FRF'])
    cy.fill('Zones FAO', ['21.1.A', '21.1.B'])

    cy.clickButton('Créer')

    cy.wait('@createFleetSegment')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[title="SEGMENT007"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('*[data-cy="delete-row-SEGMENT007"]').should('exist')
    cy.get('[title="Malotru’s segment"] > .rs-table-cell-content > .rs-input').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[title="SEGMENT007"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('[title="Malotru’s segment"] > .rs-table-cell-content > .rs-input').should('exist')
    cy.get('*[data-cy="delete-row-SEGMENT007"]').should('exist')
  })

  it('Should show previous year fleet segments', () => {
    cy.get('[data-cy="fleet-segments-select-year"]').contains(currentYear)
    cy.get('[role="row"]').should('have.length', 44)
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear - 1}`).as('fleetSegments')

    // When
    cy.get('[data-cy="fleet-segments-select-year"]').click()
    cy.get('[aria-selected="false"] > .rs-picker-select-menu-item').first().click()

    // Then
    cy.get('[data-cy="fleet-segments-select-year"]').contains(currentYear - 1)
    cy.get('[role="row"]').should('have.length', 24)
  })

  it('Should add a new year based on current year', () => {
    // Given
    const yearToAdd = currentYear - 9
    cy.get('[data-cy="fleet-segments-select-year"]').contains(currentYear)
    cy.get('[role="row"]').should('have.length', 44)

    // When
    cy.get('[data-cy="fleet-segments-add-year"]').click()
    cy.wait(200)
    cy.get(`[data-key="${yearToAdd}"]`).click({ force: true })

    // Then
    cy.get('[data-cy="fleet-segments-add-year"]').click()
    cy.get(`[data-key="${yearToAdd}"]`).should('not.exist')
    cy.get('[role="row"]').should('have.length', 44)
    cy.get('[data-cy="fleet-segments-select-year"]').contains(yearToAdd)
  })
})
