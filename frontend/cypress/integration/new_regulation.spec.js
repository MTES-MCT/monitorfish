/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('NewRegulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/newRegulation`)
    cy.wait(400)
  })
  it('Law type list contains one element equal to Reg locale / MEMN', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(0).should('have.text', 'Choisir un ensemble')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    cy.get('[data-key="Reg locale / MEMN"]').should('exist')
  })
  it('Select law type Reg locale / MEMN', () => {
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('.rs-radio-checker > label > .rs-radio-wrapper').eq(0).click()
    cy.get('[data-cy="tag-Reg locale / MEMN"]').should('exist')
  })
  /* it('Remove a selected law type', () => {
    cy.get('.rs-radio-checker label .rs-radio-wrapper').eq(0).should('have.text', 'Reg locale / MEMN')
    cy.get('.rs-radio-checker').eq(0).click()
    cy.get('[data-cy="tag-Reg locale / MEMN"]').should('not exist')
  }) */
  it('Layer name list contains one element equal to Ouest_Cotentin_Bivalves', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(1).should('have.text', 'Choisir une thématique')
    cy.get('*[class="rs-btn rs-btn-default rs-picker-toggle"]').eq(1).click()
    cy.get('.rs-picker-select-menu-items').should('have.length', 1)
    cy.get('[data-key="Ouest_Cotentin_Bivalves"]').should('exist')
  })
  it('Seafront list contains one element equal to MEMN', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(2).should('have.text', 'Choisir un secteur')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    cy.get('[data-key="MEMN"]').should('exist')
  })
})
