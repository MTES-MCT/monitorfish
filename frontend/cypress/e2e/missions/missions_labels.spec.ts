context('Missions labels', () => {
  beforeEach(() => {
    cy.loadPath('/#@-188008.06,6245230.27,8.70')
  })

  it('Missions labels Should be showed on map and movable', () => {
    cy.get('*[data-cy="mission-label-text"]').should('have.length', 3)

    cy.getComputedStyle('*[data-cy="mission-label-draggable-MISSIONS_LABEL:43"]', 1).then(styleBefore => {
      expect(styleBefore.transform).contains('matrix(1, 0, 0, 1, 32, 466)')
    })

    cy.get('*[data-cy="mission-label-draggable-MISSIONS_LABEL:43"]')
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

    cy.getComputedStyle('*[data-cy="mission-label-draggable-MISSIONS_LABEL:43"]', 1).then(styleAfter => {
      expect(styleAfter.transform).contains('matrix(1, 0, 0, 1, 510, 538)')
    })
  })
})
