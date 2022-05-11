/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Control objectives', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    const currentYear = new Date().getFullYear()
    cy.intercept('GET', `/bff/v1/control_objectives/${currentYear}`).as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
  })

  it('Should render the objectives and navigate between years', () => {
    // Then
    cy.get('.rs-table-row').should('have.length', 57)
    cy.get('.rs-table-cell-content').eq(9).contains('ATL01')
    cy.get('.rs-table-cell-content').eq(10).contains('All Trawls 3')
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '0')
    cy.get('.rs-table-cell-content').eq(12).children().should('have.value', '20')
    cy.get('.rs-table-cell-content').eq(13).children().contains('1.7')
    cy.get('.rs-table-cell-content').eq(14).children().children().children().contains('1')

    const currentYear = new Date().getFullYear()
    cy.get('*[data-cy^="control-objectives-year"]').contains(currentYear)

    cy.log('Check the FR_SCE control objectives of MEMN')
    cy.get(':nth-child(2) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="4"] > .rs-table-cell-content > .rs-input').should('have.value', '247')
    cy.get(':nth-child(2) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content > .rs-input').should('have.value', '242')

    cy.log('Navigate to previous year')
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get(`[data-key="${currentYear - 1}"] > .rs-picker-select-menu-item`).click()
    cy.get(':nth-child(2) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="4"] > .rs-table-cell-content > .rs-input').should('have.value', '147')
    cy.get(':nth-child(2) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content > .rs-input').should('have.value', '141')
  })

  it('Should update the targetNumberOfControlsAtPort field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(11).children().type('{backspace}{backspace}{backspace}{backspace}{backspace}')
    cy.get('.rs-table-cell-content').eq(11).children().type('23')
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '23')
  })

  it('Should update the targetNumberOfControlsAtSea field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(12).children().type('{backspace}{backspace}{backspace}{backspace}{backspace}')
    cy.get('.rs-table-cell-content').eq(12).children().type('23')
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(12).children().should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(12).children().should('have.value', '23')
  })

  it('Should update the controlPriorityLevel field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/78').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(14).click()
    cy.get('.rs-picker-select-menu-item').eq(2).click()
    cy.wait('@updateObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(14).children().children().children().contains('3')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-cell-content').eq(14).children().children().children().contains('3')
  })

  it('Should delete an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 57)
    cy.intercept('DELETE', '/bff/v1/control_objectives/78').as('deleteObjective')

    // When
    cy.get('*[data-cy="delete-row-78"]')
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
    cy.get('*[data-cy="delete-row-78"]').should('not.exist')
  })

  it('Should add an objective', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 56)
    cy.intercept('POST', '/bff/v1/control_objectives').as('addObjective')

    // When
    cy.get('*[data-cy="add-control-objective"]')
      .eq(0)
      .click()
    cy.get('[data-key="ATL01"] > .rs-picker-select-menu-item')
      .click()
    cy.wait('@addObjective')

    // Then
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 57)

    // Update the row when the value is updated in local memory
    cy.intercept('PUT', '/bff/v1/control_objectives/107').as('updateObjective')
    cy.get(':nth-child(1) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="4"] > .rs-table-cell-content > .rs-input')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
    cy.get(':nth-child(1) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="4"] > .rs-table-cell-content > .rs-input')
      .type('26')
    cy.wait('@updateObjective')
    cy.wait(50)
    cy.get(':nth-child(1) > .rs-table > .rs-table-body-row-wrapper > .rs-table-body-wheel-area > [aria-rowindex="2"] ' +
      '> .rs-table-cell-group > [aria-colindex="4"] > .rs-table-cell-content > .rs-input').should('have.value', '26')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(50)
    cy.get('.rs-table-row').should('have.length', 57)
  })

  it('Should permit to add a control objective year When the current year is not yet added', () => {
    // Given
    const now = new Date(2023, 3, 14).getTime()
    cy.clock(now)
    cy.get('.rs-table-row').should('have.length', 57)
    cy.get('*[data-cy^="control-objectives-year"]').contains('2022')
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)

    // Then
    cy.get('*[data-cy="control-objectives-add-year"]')
      .contains('2023')
  })

  it('Should add the next control objective year', () => {
    // Given
    cy.get('.rs-table-row').should('have.length', 57)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)
    cy.intercept('POST', '/bff/v1/control_objectives/years').as('addObjectiveYear')

    // When
    cy.get('*[data-cy="control-objectives-add-year"]')
      .click()
    cy.wait('@addObjectiveYear')

    // Then
    cy.wait(50)
    const nextYear = new Date().getFullYear() + 1
    cy.get('*[data-cy^="control-objectives-year"]').contains(nextYear)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 3)
    cy.get('.rs-table-row').should('have.length', 57)
    cy.get('*[data-cy="control-objectives-add-year"]')
      .should('be.not.visible')
  })
})
