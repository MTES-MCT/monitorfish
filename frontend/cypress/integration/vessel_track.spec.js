/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel Track', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Last position card Should be seen on the map on pointer move', () => {
    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.vessels > canvas').trigger('pointermove',  {  clientX: 460, clientY: 480, pointerId: 1, force: true })
    cy.get('.vessels > canvas').trigger('pointermove',  {  clientX: 910, clientY: 300, pointerId: 1, force: true })

    // Then
    cy.get('*[data-cy^="vessel-card-name"]').contains('EN RÉPÉTER PÈRE')
    cy.get('*[data-cy^="vessel-card-latitude"]').contains('48° 26′ 17″ N')
    cy.get('*[data-cy^="vessel-card-longitude"]').contains('006° 30′ 22″ W')
    cy.get('*[data-cy^="vessel-card-internal-reference-number"]').contains('ABC000904657')
    cy.get('*[data-cy^="vessel-card-external-reference-number"]').contains('OZ854230')
    cy.get('*[data-cy^="vessel-card-mmsi"]').contains('048713984')
    cy.get('*[data-cy^="vessel-card-ircs"]').contains('AQIK')
  })

  it.only('Position card Should be seen on the map on vessel track pointer move', () => {
    // When we click on the vessel
    cy.get('.vessels').click(460, 480, { timeout: 20000 })

    // When we move the pointer cursor to a track point (from one point to another to emit an event)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 910, clientY: 300, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 646, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 648, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 649, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 645, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 648, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 649, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 645, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 647, pointerId: 1, force: true, pixel: [411, 635] })
    cy.wait(20)
    cy.get('.vessels > canvas').trigger('pointermove',  { clientX: 411, clientY: 648, pointerId: 1, force: true, pixel: [411, 635] })


    cy.get('*[data-cy^="vessel-track-card-latitude"]').contains('47° 38′ 24″ N')
    cy.get('*[data-cy^="vessel-track-card-longitude"]').contains('008° 07′ 02″ W')
    cy.get('*[data-cy^="vessel-track-card-course"]').contains('17°')
    cy.get('*[data-cy^="vessel-track-card-speed"]').contains('8.6')
  })
})
