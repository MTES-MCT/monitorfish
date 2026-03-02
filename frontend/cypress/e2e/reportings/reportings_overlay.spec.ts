context('Reportings overlay', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    // Center on NAMO area near reporting id=8 (lat=48.1, lon=-4.9) and id=9 (lat=47.4, lon=-5.2)
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)
  })

  it('An overlay Should be showed, movable and closed', () => {
    // Click on reporting feature (coordinates are empirically adjusted for this map center & zoom)
    cy.get('#root').click(640, 360)

    cy.get('*[data-cy="reporting-overlay"]').should('be.visible')
    cy.get('*[data-cy="reporting-overlay-close"]').click()
    cy.get('*[data-cy="reporting-overlay"]').should('not.exist')

    // Reopen
    cy.wait(100)
    cy.get('#root').click(640, 360)

    cy.getComputedStyle('*[data-cy="reporting-overlay"]', 2).then(styleBefore => {
      expect(styleBefore.transform).to.include('matrix')
    })

    // Drag the overlay
    cy.get('*[data-cy="reporting-overlay"]')
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

    cy.getComputedStyle('*[data-cy="reporting-overlay"]', 2).then(styleAfter => {
      expect(styleAfter.transform).to.include('matrix')
    })
  })
})
