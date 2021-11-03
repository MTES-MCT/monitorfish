/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Measurement', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('A circle range measurement Should be created When clicking on the map', () => {
    // Given
    cy.get('.measurement', { timeout: 20000 }).should('exist')

    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('#root').click(450, 585, { timeout: 20000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 5.', { timeout: 20000 })
    cy.get('*[data-cy="close-measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A circle range measurement Should be created When the radius in entered in input', () => {
    // Given
    cy.get('.measurement', { timeout: 20000 }).should('exist')

    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('*[data-cy="dms-coordinates-input"]').eq(0).should('have.value', '47° 48′ 56″ N 007° 54′ 51″ W')
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('35', { timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 35 nm', { timeout: 20000 })
    cy.get('*[data-cy="close-measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A circle range measurement Should be created When the coordinates and radius are entered in input', () => {
    // Given
    cy.get('.measurement', { timeout: 20000 }).should('exist')

    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 20000 })
    cy.get('*[data-cy="dms-coordinates-input"]').eq(0).type('470123N0070123W', { timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('47', { timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 47 nm', { timeout: 20000 })
    cy.get('#root').click(789, 556, { timeout: 20000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A multi line range measurement Should be created When clicking on the map', () => {
    // Given
    cy.get('.measurement', { timeout: 20000 }).should('exist')

    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-multiline"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('#root').click(420, 635, { timeout: 20000 })
    cy.get('#root').dblclick(560, 620, { timeout: 20000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('31.3', { timeout: 20000 })
    cy.get('#root').click(590, 590, { timeout: 20000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('Many measurements Should be created When clicking on the map', () => {
    // Given
    cy.get('.measurement', { timeout: 20000 }).should('exist')

    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('#root').click(450, 585, { timeout: 20000 })

    cy.get('*[data-cy="measurement"]').click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 20000 })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 20000 }).eq(1).should('have.value', '__° __′ __″ _ ___° __′ __″ _')
    cy.get('#root').click(690, 680, { timeout: 20000 })
    cy.get('#root').click(750, 785, { timeout: 20000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').eq(1).contains('r = 5.', { timeout: 20000 })
    cy.get('*[data-cy="close-measurement"]').eq(1).click({ timeout: 20000 })
    cy.get('*[data-cy="close-measurement"]').eq(0).click({ timeout: 20000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })
})
