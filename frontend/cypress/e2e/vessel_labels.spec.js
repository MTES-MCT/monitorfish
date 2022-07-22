/// <reference types="cypress" />

context('Vessel labels', () => {
  beforeEach(() => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.get('*[data-cy="first-loader"]', { timeout: 10000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Risk factors Should be showed on the map', () => {
    // Then
    cy.get('*[data-cy="vessel-label-risk-factor"]').should('have.length', 19)
    // And the ship "FRAIS AVIS MODE" contains a risk factor of 2.6
    cy.get('*[data-cy="vessel-label-risk-factor"]').eq(0).contains(2.6)
  })

  it('Vessels names Should be showed on the map', () => {
    // When
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })

    cy.get('*[data-cy="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 10000 })
    cy.get('#root').dblclick(880, 760, { timeout: 10000 })

    // Then
    cy.contains('*[data-cy="vessel-label-text"]', 'FRAIS AVIS MODE')
    cy.get('*[data-cy="FRAIS AVIS MODE-under-charter"]').should('exist')
  })

  it('Vessels names Should be movable', () => {
    // When
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 10000 })
    // cy.get('body').type('{upArrow}')
    cy.get('*[data-cy="vessel-label-draggable-FAK000999999/DONTSINK/CALLME"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="vessel-label-draggable-FAK000999999/DONTSINK/CALLME"]')
      .trigger('pointerdown', { force: true, which: 1, eventConstructor: 'MouseEvent', animationDistanceThreshold: 100, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 400, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 600, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })
  })

  it('Vessel risk factors should not open When moved', () => {
    // When
    cy.get('*[data-cy="vessel-label-risk-factor"]').first()
      .trigger('pointerdown', { force: true, which: 1, eventConstructor: 'MouseEvent', animationDistanceThreshold: 100, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 400, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 600, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })
      .trigger('click', { force: true, pointerId: 1 })

    // Then
    cy.get('*[data-cy="vessel-label-risk-factor-details"]').should('have.length', 0)

    // But when we click to open risk factors details it open the box
    cy.get('*[data-cy="vessel-label-risk-factor"]').first().click()
    cy.get('*[data-cy="vessel-label-risk-factor-details"]').should('have.length', 1)
  })

  it('Vessel sidebar should not open When moved', () => {
    // Given
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 10000 })

    // When
    cy.get('*[data-cy="vessel-label-text"]').first()
      .trigger('pointerdown', { force: true, which: 1, eventConstructor: 'MouseEvent', animationDistanceThreshold: 100, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 400, pointerId: 1 })
      .trigger('pointermove', { force: true, clientX: 600, clientY: 600, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })
      .trigger('click', { force: true, pointerId: 1 })

    // Then
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('not.exist')

    // But when we click on vessel name it opens the vessel sidebar
    cy.get('*[data-cy="vessel-label-text"]').first().click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
  })
})
