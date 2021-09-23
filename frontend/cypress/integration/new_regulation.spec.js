/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('NewRegulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/newRegulation`)
    cy.wait(400)
  })
  it('Law type list contains four elements equal', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(0).should('have.text', 'Choisir un ensemble')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('*[class="rs-picker-select-menu-items"]').should('exist').should('have.length', 1)
    cy.get('*[class="rs-picker-select-menu-item"').should('exist').should('have.length', 3)
    cy.get('[data-key="Reg locale / MEMN"]').should('exist')
    cy.get('[data-key="Reg locale / NAMO"]').should('exist')
    cy.get('[data-key="Reg locale / Outre-mer"]').should('exist')
  })
  it('Select, change and remove law type Reg locale / MEMN', () => {
    // Open menu and select "Reg locale / MEMN",  the tag is displayed
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('.rs-radio-checker > label > .rs-radio-wrapper').eq(0).click()
    cy.get('[data-cy="tag-Reg locale / MEMN"]').should('exist')

    // Change selected law type, select "Reg locale / NAMO"
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('.rs-radio-checker > label > .rs-radio-wrapper').eq(1).click()
    cy.get('[data-cy="tag-Reg locale / NAMO"]').should('exist')

    // Remove tag
    cy.get('[data-cy="close-tag-Reg locale / NAMO"]').click()
    cy.get('[data-cy="tag-Reg locale / NAMO"]').should('not.exist')
  })
  it('Layer name list contains one element equal to Ouest_Cotentin_Bivalves', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(1).should('have.text', 'Choisir une thématique')
    cy.get('*[class="rs-btn rs-btn-default rs-picker-toggle"]').eq(1).click()
    cy.get('.rs-picker-select-menu-items').should('have.length', 1)
    cy.get('.rs-picker-select-menu-item').should('have.length', 3)
    cy.get('[data-key="Ouest_Cotentin_Bivalves"]').should('exist')
    cy.get('[data-key="Armor_CSJ_Dragues"]').should('exist')
    cy.get('[data-key="Mayotte_Poulpes"]').should('exist')
  })
  it('Seafront list contains one element equal to MEMN', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(2).should('have.text', 'Choisir un secteur')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    cy.get('.rs-picker-select-menu-item').should('exist').should('have.length', 3)
    cy.get('[data-key="MEMN"]').should('exist')
    cy.get('[data-key="NAMO"]').should('exist')
    cy.get('[data-key="Outre-mer"]').should('exist')
  })
})
