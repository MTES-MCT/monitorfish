/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('NewRegulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/regulation/new`)
    cy.wait(400)
  })

  it('Law type list contains 8 elements', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(0).should('have.text', 'Choisir un ensemble')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('*[class="rs-picker-select-menu-items"]').should('exist').should('have.length', 1)
    cy.get('*[class="rs-picker-select-menu-item"]').should('exist').should('have.length', 8)
  })

  it('Select, change and remove law type Reg. MEMN', () => {
    // Open menu and select "Reg. MEMN",  the tag is displayed
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. MEMN"]').eq(0).click()
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')

    // Change selected law type, select "Reg. NAMO"
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. NAMO"]').eq(0).click()
    cy.get('[data-cy="tag-Reg. NAMO"]').should('exist')

    // Remove tag
    cy.get('[data-cy="close-tag-Reg. NAMO"]').click()
    cy.get('[data-cy="tag-Reg. NAMO"]').should('not.exist')
  })

  it('Change law type update the layer name list', () => {
    // Select Reg. MEMN in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. MEMN"]').eq(0).click()
    // Select the first layer name in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click()
    cy.get('[data-key="Ouest_Cotentin_Bivalves"]').should('exist')

    // Select Reg. NAMO law type in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. NAMO"]').eq(0).click()
    // Select the first layer name in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click()
    // layer name should have changed
    cy.get('[data-key="Armor_CSJ_Dragues"]').should('exist')
  })

  it('select UE law_type should display an empty list', () => {
    // Select R(CE) 494/2002 in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="R(CE) 494/2002"]').eq(0).click()

    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click()
    cy.get('.rs-picker-none').contains('aucune thématique à afficher')
  })

  it('Adding a zone name change input background', () => {
    cy.get('.rs-input').eq(0).type('new zone name')
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(229, 229, 235)')
    cy.get('.rs-input').eq(0).clear()
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })

  it('If a french law type has been selected, region list contains 13 elements', () => {
    // Select a french law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. MED"]').eq(0).click()
    // Region select picker should not be disabled
    cy.get('.rs-picker-toggle-placeholder').eq(2).should('have.text', 'Choisir une région')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    // Region list length should be equal to 18
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    cy.get('.rs-picker-select-menu-item').should('exist').should('have.length', 18)
  })

  it('If a EU law type has been selected, region list should be disabled', () => {
    // Select a EU law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="R(UE) 2019/1241"]').eq(0).click()
    // Region select picker should be disabled
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).should('have.attr', 'aria-disabled', 'true')
  })
  it('Select "Grand Est" and "Auvergne-Rhône-Alpes" region and remove it', () => {
    // Select a french law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="Reg. MED"]').eq(0).click()
    // Select "Auvergne-Rhône-Alpes" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.get('[data-key="Auvergne-Rhône-Alpes"]').click()
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('exist')
    // Select "Grand Est" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.get('[data-key="Grand Est"]').click()
    cy.get('[data-cy="tag-Grand Est"]').should('exist')
    // 3 tags exists (1 seafront and 2 regions)
    cy.get('[data-cy^="tag"]').should('have.length', 3)
    // Remove tag
    cy.get('[data-cy="close-tag-Auvergne-Rhône-Alpes"]').click()
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('not.exist')
    // 3 tags still exists (1 seafront and 1 regions)
    cy.get('[data-cy^="tag"]').should('have.length', 2)
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

  it('A modal should be open on go back button click', () => {
    // When
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    // then
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-text"]').should('have.text', 'Voulez-vous enregistrer les modifications\napportées à la réglementation ?')
  })

  it('Confirm modal is closed on close icon click', () => {
    // Given
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-close-icon"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
  })

  it('Confirm modal is closed on confirm button click and error is displayed', () => {
    // Given
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.get('[data-cy="save-forbidden-btn"]').should('exist')
  })

  it('New regulation page is closed and backoffice list is displayed on cancel button click', () => {
    // Given
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-cancel-button"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.url().should('include', '/backoffice')
  })
})
