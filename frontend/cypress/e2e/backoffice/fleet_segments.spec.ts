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

  it('Should list and update fleet segments', () => {
    // -------------------------------------------------------------------------
    cy.log('Should render the fleet segments')

    // Then
    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="1"]').contains('1.7')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').contains('ATL01')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="3"]').contains('All Trawls 3')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('OTM')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('PTM')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('BFT')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('27.7')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('27.8')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('27.9')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('27.10')

    // -------------------------------------------------------------------------
    cy.log('Should update the segment')

    // When
    cy.intercept('PUT', `/bff/v1/fleet_segments/backoffice?year=${currentYear}&segment=ATL01`).as('updateFleetSegment')

    cy.get('[aria-rowindex="2"]').find('[title="Editer la ligne"]').click()
    cy.fill('Nom', 'ATL036')
    cy.fill('Note d’impact', 1.2)
    cy.fill('Description', 'All Trawls 45')
    cy.fill('Engins', ['DRM', 'FAG'])
    cy.fill('Espèces ciblées', ['COD'])
    cy.fill('Prises accessoires', ['HKE'])
    cy.fill('Zones FAO', ['21.0.A'])
    cy.clickButton('Modifier')

    cy.wait('@updateFleetSegment').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        bycatchSpecies: ['HKE'],
        dirm: ['MED', 'SA', 'NAMO', 'MEMN'],
        faoAreas: ['21.0.A'],
        gears: ['DRM', 'FAG'],
        impactRiskFactor: 1.2,
        segment: 'ATL036',
        segmentName: 'All Trawls 45',
        targetSpecies: ['COD'],
        year: 2024
      })
    })

    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="1"]').contains('1.2')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').contains('ATL036')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="3"]').contains('All Trawls 45')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('DRM')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('FAG')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('COD')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="6"]').contains('HKE')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.0.A')

    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')

    cy.get('.rs-table-row').should('have.length', 44)
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="1"]').contains('1.2')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').contains('ATL036')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="3"]').contains('All Trawls 45')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('DRM')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('FAG')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('COD')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="6"]').contains('HKE')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.0.A')
  })

  it('Should create a new fleet segment and delete it', () => {
    // Given
    cy.intercept('POST', '/bff/v1/fleet_segments/backoffice').as('createFleetSegment')

    // When
    cy.clickButton('Ajouter un segment')
    cy.fill('Nom', 'ABC123')
    cy.fill('Note d’impact', 2.7)
    cy.fill('Description', 'Malotru’s segment')
    cy.fill('Engins', ['DHS', 'FCN'])
    cy.fill('Espèces ciblées', ['COD', 'SOL'])
    cy.fill('Prises accessoires', ['FRF'])
    cy.fill('Zones FAO', ['21.1.A', '21.1.B'])

    cy.clickButton('Ajouter')
    cy.wait('@createFleetSegment')

    // Then
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="1"]').contains('2.7')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').contains('ABC123')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="3"]').contains('Malotru’s segment')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('DHS')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('FCN')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('COD')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('SOL')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="6"]').contains('FRF')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.1.A')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.1.B')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.visit('/backoffice/fleet_segments')
    cy.wait('@fleetSegments')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="1"]').contains('2.7')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').contains('ABC123')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="3"]').contains('Malotru’s segment')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('DHS')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="4"]').contains('FCN')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('COD')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="5"]').contains('SOL')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="6"]').contains('FRF')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.1.A')
    cy.get('[aria-rowindex="2"]').find('[aria-colindex="7"]').contains('21.1.B')

    // -------------------------------------------------------------------------
    cy.log('Should delete a fleet segment')

    cy.intercept('DELETE', `/bff/v1/fleet_segments/backoffice?year=${currentYear}&segment=ABC123`).as(
      'deleteFleetSegment'
    )
    cy.get('[aria-rowindex="2"]').find('[title="Supprimer la ligne"]').click()
    cy.wait('@deleteFleetSegment')

    cy.get('[aria-rowindex="2"]').find('[aria-colindex="2"]').should('not.contain', 'ABC123')
  })

  it('Should show previous year fleet segments', () => {
    cy.get('[id="fleet-segments-select-year-describe"]').contains(currentYear)
    cy.get('[role="row"]').should('have.length', 44)
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear - 1}`).as('fleetSegments')

    // When
    cy.fill('Année', `${currentYear - 1}`)

    // Then
    cy.get('[id="fleet-segments-select-year-describe"]').contains(currentYear - 1)
    cy.get('[role="row"]').should('have.length', 24)
  })

  it('Should add a new year based on current year', () => {
    // Given
    const yearToAdd = currentYear - 9
    cy.get('[id="fleet-segments-select-year-describe"]').contains(currentYear)
    cy.get('[role="row"]').should('have.length', 44)

    // When
    cy.fill("l'année", `${yearToAdd}`)

    // Then
    cy.get('[id="fleet-segments-select-year-describe"]').contains(yearToAdd)
    cy.get('[role="row"]').should('have.length', 44)
  })
})
