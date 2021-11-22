/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Control objectives', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.wait(200)
  })

  it('Should render the objectives', () => {
    // Then
    cy.get('.rs-table-row').should('have.length', 57)
    cy.get('.rs-table-cell-content').eq(8).contains('ATL01')
    cy.get('.rs-table-cell-content').eq(9).contains('All Trawls 3')
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', '0')
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '20')
    cy.get('.rs-table-cell-content').eq(12).children().contains('1.7')
    cy.get('.rs-table-cell-content').eq(13).children().children().children().contains('1')
  })

  it('Should update the targetNumberOfControlsAtPort field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/25').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(10).children().type('{backspace}{backspace}{backspace}{backspace}{backspace}')
    cy.get('.rs-table-cell-content').eq(10).children().type('23')
    cy.wait('@updateObjective')

    // Then
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.get('.rs-table-cell-content').eq(10).children().should('have.value', '23')
  })

  it('Should update the targetNumberOfControlsAtSea field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/25').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(11).children().type('{backspace}{backspace}{backspace}{backspace}{backspace}')
    cy.get('.rs-table-cell-content').eq(11).children().type('23')
    cy.wait('@updateObjective')

    // Then
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '23')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.get('.rs-table-cell-content').eq(11).children().should('have.value', '23')
  })

  it('Should update the controlPriorityLevel field on an objective', () => {
    // When
    cy.intercept('PUT', '/bff/v1/control_objectives/25').as('updateObjective')
    cy.get('.rs-table-cell-content').eq(13).click()
    cy.get('.rs-picker-select-menu-item').eq(2).click()
    cy.wait('@updateObjective')

    // Then
    cy.get('.rs-table-cell-content').eq(13).children().children().children().contains('3')

    // The value is saved in database when I refresh the page
    cy.intercept('GET', '/bff/v1/control_objectives').as('controlObjectives')
    cy.visit(`http://localhost:${port}/backoffice/control_objectives`)
    cy.wait('@controlObjectives')
    cy.get('.rs-table-cell-content').eq(13).children().children().children().contains('3')
  })
})
