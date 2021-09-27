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
  it('Adding a zone name change input background', () => {
    cy.get('.rs-input').eq(0).type('new zone name')
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(229, 229, 235)')
    cy.get('.rs-input').eq(0).clear()
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })
  it('Region list contains 13 elements', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(3).should('have.text', 'Choisir une région')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(3).click()
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    cy.get('.rs-picker-select-menu-item').should('exist').should('have.length', 18)
  })
  it('Select "Grand Est" and "Auvergne-Rhône-Alpes" region and remove it', () => {
    // Select "Auvergne-Rhône-Alpes" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(3).click()
    cy.get('[data-key="Auvergne-Rhône-Alpes"]').click()
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('exist')
    // Select "Grand Est" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(3).click()
    cy.get('[data-key="Grand Est"]').click()
    cy.get('[data-cy="tag-Grand Est"]').should('exist')
    cy.get('[data-cy^="tag"]').should('have.length', 2)
    // Remove tag
    cy.get('[data-cy="close-tag-Auvergne-Rhône-Alpes"]').click()
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('not.exist')
    cy.get('[data-cy^="tag"]').should('have.length', 1)
  })
  it('Enter a reg text name with a valid url', () => {
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    // When button is clicked
    cy.get('[data-cy="save-reg-text-name"]').click()
    // Tag appeared
    cy.get('[data-cy="tag-zone name"]').should('exist')
    // When close icon is clicked
    cy.get('[data-cy="close-tag-zone name"]').click()
    // Tag disappeared
    cy.get('[data-cy="tag-zone name"]').should('not.exist')
  })
  it('Enter and clear reg zone name form', () => {
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    // When button is clicked
    cy.get('[data-cy="clear-reg-text-name"]').click()
    cy.get('[data-cy="reg-text-name"]').invoke('val').should('equal', '')
    cy.get('[data-cy="reg-text-url"]').invoke('val').should('equal', '')
  })
  it('Enter a reg text name with an invalid url', () => {
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[ data-cy="reg-text-url"]').type('url.com')
    // When save button is clicked
    cy.get('[data-cy="save-reg-text-name"]').click({ timeout: 10000 })
    // Red border are displayed
    cy.get('[data-cy="reg-text-url"]').should('have.css', 'border-color', 'rgb(225, 0, 15)')
  })
  it('Enter a reg text name with missing name', () => {
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    // When save button is clicked
    cy.get('[data-cy="save-reg-text-name"]').click({ timeout: 10000 })
    // Red border are displayed
    cy.get('[data-cy="reg-text-name"]').should('have.css', 'border-color', 'rgb(225, 0, 15)')
  })
})
