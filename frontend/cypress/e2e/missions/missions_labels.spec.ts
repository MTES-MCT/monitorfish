/// <reference types="cypress" />

context('Missions labels', () => {
  beforeEach(() => {
    cy.loadPath('/#@-188008.06,6245230.27,8.70')
  })

  it('Missions labels Should be showed on the map', () => {
    // Then
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 3)
    cy.get('*[data-cy="mission-label-text"]').eq(0).contains('DREAL PAYS-DE-LA-LOIRE')
  })

  it('Missions labels Should be movable', () => {
    // Given
    cy.getComputedStyle('*[data-cy="mission-label-draggable-mission_label:43"]', 1).then(styleBefore => {
      expect(styleBefore.transform).contains('matrix(1, 0, 0, 1, 32, 466)')
    })

    // When
    cy.get('*[data-cy="mission-label-draggable-mission_label:43"]')
      .trigger('pointerdown', {
        animationDistanceThreshold: 100,
        eventConstructor: 'MouseEvent',
        force: true,
        pointerId: 1,
        which: 1
      })
      .trigger('pointermove', { clientX: 600, clientY: 400, force: true, pointerId: 1 })
      .trigger('pointermove', { clientX: 600, clientY: 600, force: true, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })

    // Then
    cy.getComputedStyle('*[data-cy="mission-label-draggable-mission_label:43"]', 1).then(styleAfter => {
      expect(styleAfter.transform).contains('matrix(1, 0, 0, 1, 511, 539)')
    })
  })
})
