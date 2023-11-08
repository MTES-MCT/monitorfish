import { stubSideWindowOptions } from '../../support/commands'

context('Controls overlay', () => {
  beforeEach(() => {
    cy.intercept('GET', `/bff/v1/missions*`).as('missions')
    cy.visit('/#@-27112.04,6363415.43,10.02', stubSideWindowOptions)
    cy.wait('@missions')
    cy.wait(500)
  })

  it('A control overlay Should be showed and closed', () => {
    // First, open the mission overlay
    cy.get('#root').click(611, 595)

    cy.get('*[data-cy="mission-overlay"]').contains('BSN STE MAXIME')
    cy.get('*[data-cy="mission-overlay"]').contains('et 2 autres unités')
    cy.get('*[data-cy="mission-overlay"]').contains('Ouverte par le CACEM')
    cy.get('*[data-cy="mission-overlay"]').contains('Mission Terre / Mer')
    cy.get('*[data-cy="mission-overlay"]').contains('1 contrôle réalisé')
    cy.get('*[data-cy="mission-overlay"]').contains('En cours')

    // Open the control overlay
    cy.get('#root').click(405, 624)
    // Double the click to avoid many Cypress retries
    cy.get('#root').click(404, 624)

    cy.get('*[data-cy="mission-action-overlay"]').contains('Contrôle du navire NOM INCONNU')
    cy.get('*[data-cy="mission-action-overlay"]').contains('Aucune infraction')

    cy.intercept('GET', '/api/v1/missions/34').as('getMission')
  })

  it('A control overlay Should be movable', () => {
    cy.wait(200)
    // First, open the mission overlay
    cy.get('#root').click(611, 595)
    cy.wait(100)

    // Open the control overlay
    cy.get('#root').click(405, 624)
    cy.wait(100)
    // Double the click to avoid many Cypress retries
    cy.get('#root').click(404, 624)

    cy.getComputedStyle('*[data-cy="mission-action-overlay"]', 2).then(styleBefore => {
      expect(styleBefore.transform).contains('matrix(1, 0, 0, 1, 406, 577)')
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
      expect(styleAfter.transform).contains('matrix(1, 0, 0, 1, 300, 347)')
    })
  })
})
