/* eslint-disable no-undef */

context('BackOffice > Control Objective Tables > Actions', () => {
  beforeEach(() => {
    cy.login('superuser')
    const currentYear = new Date().getFullYear()
    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.intercept('GET', `/bff/v1/admin/control_objectives/${currentYear}`).as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@fleetSegments')
    cy.wait('@controlObjectives')
  })

  it('Should update the targetNumberOfControlsAtPort field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/admin/control_objectives/78').as('updateObjective')
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
    cy.intercept('GET', '/bff/v1/admin/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtPort"]').should('have.value', '23')
  })

  it('Should update the targetNumberOfControlsAtSea field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/admin/control_objectives/78').as('updateObjective')
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
    cy.intercept('GET', '/bff/v1/admin/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('*[data-cy="row-78-targetNumberOfControlsAtSea"]').should('have.value', '23')
  })

  it('Should update the controlPriorityLevel field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/admin/control_objectives/78').as('updateObjective')
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').parent().click()
    cy.get('.rs-picker-select-menu-item').eq(2).click()
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/admin/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('[data-cy="row-78-controlPriorityLevel"]').should('exist')
  })

  it('Should delete an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 67)
    cy.intercept('DELETE', '/bff/v1/admin/control_objectives/78').as('deleteObjective')

    // When
    cy.get('*[data-cy="delete-row-78"]').click()
    cy.wait('@deleteObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 66)

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/admin/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 66)
    cy.get('*[data-cy="delete-row-78"]').should('not.exist')
  })

  it('Should add an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 66)
    cy.intercept('POST', '/bff/v1/admin/control_objectives').as('addObjective')
    cy.wait(200)

    // When
    cy.get('*[data-cy="add-control-objective"]').eq(0).click()
    cy.get('[data-key="FR_DRB"] > .rs-picker-select-menu-item').click()
    cy.wait('@addObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 67)

    // Update the row when the value is updated in local memory
    cy.intercept('PUT', '/bff/v1/admin/control_objectives/125').as('updateObjective')
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}'
    )
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').type('26')
    cy.wait('@updateObjective')
    cy.wait(50)
    cy.get('[data-cy="row-125-targetNumberOfControlsAtPort"]').should('exist')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/admin/control_objectives').as('controlObjectives')
    cy.visit('/backoffice/control_objectives')
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 67)
  })

  it('Should add the next control objective year', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)
    cy.intercept('POST', '/bff/v1/admin/control_objectives/years').as('addObjectiveYear')

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
