/* eslint-disable no-undef */

context('Control objectives', () => {
  beforeEach(() => {
    const currentYear = new Date().getFullYear()
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.intercept('GET', `/bff/v1/control_objectives/${currentYear}`).as('controlObjectives')
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

  it('Should update the targetNumberOfControlsAtPort field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtPort"]')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
      .type('2')
      .type('3')
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtPort"]').should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtPort"]').should('have.value', '23')
  })

  it('Should update the targetNumberOfControlsAtSea field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtSea"]')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
      .type('2')
      .type('3')
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtSea"]').should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtSea"]').should('have.value', '23')
  })

  it('Should update the controlPriorityLevel field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').parent().click()
    cy.get('.rs-picker-select-menu-item').eq(2).click()
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').should('exist')
  })

  it('Should delete an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 67)
    cy.intercept('DELETE', '/bff/v1/control_objectives/78').as('deleteObjective')

    // When
    cy.get('*[data-cy="delete-row-78"]').click()
    cy.wait('@deleteObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 66)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 66)
    cy.get('*[data-cy="delete-row-78"]').should('not.exist')
  })

  it('Should add an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 66)
    cy.intercept('POST', '/bff/v1/control_objectives').as('addObjective')
    cy.wait(200)

    // When
    cy.get('*[data-cy="add-control-objective"]').eq(0).click()
    cy.get('[data-key="FR_DRB"] > .rs-picker-select-menu-item').click()
    cy.wait('@addObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 67)

    // Update the row when the value is updated in local memory
    cy.intercept('PUT', '/bff/v1/control_objectives/125').as('updateObjective')
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}'
    )
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').type('26')
    cy.wait('@updateObjective')
    cy.wait(50)
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 67)
  })

  it('Should permit to add a control objective year When the current year is not yet added', () => {
    // Given
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    const now = new Date(nextYear, 3, 14).getTime()

    cy.clock(now)
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('*[data-cy^="control-objectives-year"]').contains(currentYear)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)

    // Then
    cy.get('*[data-cy="control-objectives-add-year"]').contains(nextYear)
  })

  it('Should add the next control objective year', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)
    cy.intercept('POST', '/bff/v1/control_objectives/years').as('addObjectiveYear')

    // When
    cy.get('*[data-cy="control-objectives-add-year"]').click()
    cy.wait('@addObjectiveYear')

    // Then
    cy.wait(50)
    const nextYear = new Date().getFullYear() + 1
    cy.get('*[data-cy^="control-objectives-year"]').contains(nextYear)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 3)
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('*[data-cy="control-objectives-add-year"]').should('be.not.visible')
  })
})
