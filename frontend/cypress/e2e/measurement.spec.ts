/// <reference types="cypress" />

context('Measurement', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('A circle range measurement Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('#root').click(450, 585, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 5.', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A circle range measurement Should be created When the radius in entered in input', () => {
    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]').should('have.value', '47° 48′ 56″ N 007° 54′ 51″ W')
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('35', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 10000 })
    cy.wait(100)

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 35 nm', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A circle range measurement Should be created When the coordinates and radius are entered in input', () => {
    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]').type('470123N0070123W', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('47', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 10000 })
    cy.wait(100)

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 47 nm', { timeout: 10000 })
    cy.get('#root').click(789, 556, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A multi line range measurement Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-multiline"]').click({ timeout: 10000 })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('#root').click(420, 635, { timeout: 10000 })
    cy.get('#root').dblclick(560, 620, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('31.3', { timeout: 10000 })
    cy.get('#root').click(590, 590, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('Many measurements Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('#root').click(450, 585, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('have.length', 1)

    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 }).should(
      'have.value',
      '__° __′ __″ _ ___° __′ __″ _'
    )
    cy.get('#root').click(690, 680, { timeout: 10000 })
    cy.get('#root').click(750, 785, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('have.length', 2)

    // Then
    cy.get('*[data-cy="measurement-value"]').eq(1).contains('r = 5.', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').eq(1).click({ timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').eq(0).click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })
})
