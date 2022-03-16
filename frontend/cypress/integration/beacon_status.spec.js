/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Beacon malfunction', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-689844.87,6014092.52,10.57`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-68')
  })

  it('Vessels with beacon malfunction Should be showed on map with a yellow circle', () => {
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 2)
    cy.get('.vessels').eq(0).toMatchImageSnapshot({
      clip: { x: 510, y: 0, width: 200, height: 200 }
    })
  })
})
