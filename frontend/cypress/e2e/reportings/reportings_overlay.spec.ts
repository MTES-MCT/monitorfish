import {hoverOrClickVesselByName} from "../../support/commands/hoverOrClickVesselByName";

context('Reportings overlay', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    // Center on NAMO area near reporting id=8 (lat=48.1, lon=-4.9) and id=9 (lat=47.4, lon=-5.2)
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)
  })

  it('An overlay Should be showed', () => {
    // Hover
    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'hover', 12)
    cy.get('*[data-cy="reporting-overlay"]').should('be.visible')
    cy.getComputedStyle('*[data-cy="reporting-overlay"]', 2).then(styleBefore => {
      expect(styleBefore.transform).to.include('matrix')
    })
    cy.getDataCy('reporting-overlay').contains('RENCONTRER VEILLER APPARTEMENT')
    cy.getDataCy('reporting-overlay').contains('INN')
    cy.getDataCy('reporting-overlay').contains('Suspicion d\'infraction')
    cy.getDataCy('reporting-overlay').contains('Pêche sans VMS')

    /* TODO Add tests for click events

    cy.get('*[data-cy="reporting-overlay-close"]').click()
    cy.get('*[data-cy="reporting-overlay"]').should('not.exist')
    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'click', 12)

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
    cy.get('*[data-cy="reporting-overlay-close"]').click()

    // Hover
    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'hover', 12)

     */
  })
})
