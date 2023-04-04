/// <reference types="cypress" />

context('Controls overlay', () => {
  beforeEach(() => {
    cy.loadPath('/#@-27112.04,6363415.43,10.02')
  })

  it('A control overlay Should be showed and closed', () => {
    // First, open the mission overlay
    cy.get('#root').click(611, 612)

    cy.get('*[data-cy="mission-overlay"]').contains('BSN STE MAXIME')
    cy.get('*[data-cy="mission-overlay"]').contains('et 2 autres unités')
    cy.get('*[data-cy="mission-overlay"]').contains('Ouverte par le CACEM')
    cy.get('*[data-cy="mission-overlay"]').contains('Mission Mer')
    cy.get('*[data-cy="mission-overlay"]').contains('1 contrôle réalisé')
    cy.get('*[data-cy="mission-overlay"]').contains('En cours')

    // Open the control overlay
    cy.get('#root').click(405, 644)

    cy.get('*[data-cy="mission-action-overlay"]').contains('Contrôle du navire NOM INCONNU')
    cy.get('*[data-cy="mission-action-overlay"]').contains('Aucune infraction')
    cy.get('*[data-cy="mission-action-overlay"]').contains('Aucune appréhension')

    cy.intercept('GET', '/api/v1/missions/34').as('getMission')
    cy.get('[data-cy="edit-mission-control"]').click()
    cy.wait('@getMission')

    // Close the mission and the control overlay
    cy.get('*[data-cy="mission-overlay-close"]').click()
    cy.get('*[data-cy="mission-overlay"]').should('not.exist')
    cy.get('*[data-cy="mission-action-overlay"]').should('not.exist')
  })

  it('A control overlay Should be movable', () => {
    // First, open the mission overlay
    cy.get('#root').click(611, 612)

    // Open the control overlay
    cy.get('#root').click(405, 644)

    cy.getComputedStyle('*[data-cy="mission-action-overlay"]', 2).then(styleBefore => {
      expect(styleBefore.transform).contains('matrix(1, 0, 0, 1, 406, 602)')
    })

    // When
    cy.get('*[data-cy="mission-action-overlay"]')
      .trigger('pointerdown', {
        animationDistanceThreshold: 100,
        eventConstructor: 'MouseEvent',
        force: true,
        pointerId: 1,
        which: 1
      })
      .trigger('pointermove', { clientX: 400, clientY: 500, force: true, pointerId: 1 })
      .trigger('pointermove', { clientX: 300, clientY: 300, force: true, pointerId: 1 })
      .trigger('pointerup', { force: true, pointerId: 1 })

    // Then
    cy.getComputedStyle('*[data-cy="mission-action-overlay"]', 2).then(styleAfter => {
      expect(styleAfter.transform).contains('matrix(1, 0, 0, 1, 300, 367)')
    })
  })
})
