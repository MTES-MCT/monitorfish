context('Missions overlay', () => {
  beforeEach(() => {
    cy.loadPath('/#@-188008.06,6245230.27,8.70')
  })

  it('An overlay Should be showed and closed', () => {
    cy.get('#root').click(337, 819)

    cy.get('*[data-cy="mission-overlay"]').contains('BGC LORIENT')
    cy.get('*[data-cy="mission-overlay"]').contains('Mission Air / Terre')
    cy.get('*[data-cy="mission-overlay"]').contains('Aucun contact renseigné')
    cy.get('*[data-cy="mission-overlay"]').contains('Terminée')
    cy.get('*[data-cy="mission-overlay"]').contains('À compléter')
    cy.get('*[data-cy="mission-overlay"]').contains('0 contrôle réalisé')
    cy.get('*[data-cy="mission-overlay"]').contains('Actions CACEM')

    cy.get('*[data-cy="mission-overlay-close"]').click()
    cy.get('*[data-cy="mission-overlay"]').should('not.exist')
  })

  it('A mission overlay Should be movable', () => {
    // Given
    cy.get('#root').click(337, 819)

    cy.getComputedStyle('*[data-cy="mission-overlay"]', 2).then(styleBefore => {
      expect(styleBefore.transform).contains('matrix(1, 0, 0, 1, 333, 782)')
    })

    // When
    cy.get('*[data-cy="mission-overlay"]')
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
    cy.getComputedStyle('*[data-cy="mission-overlay"]', 2).then(styleAfter => {
      expect(styleAfter.transform).contains('matrix(1, 0, 0, 1, 605, 703)')
    })
  })
})
