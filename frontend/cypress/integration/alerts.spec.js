/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Alerts', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Should be showed on map When vessels have alerts', () => {
    // When
    cy.get('.vessels').dblclick(300, 400, { force: true })
    cy.get('.vessels').dblclick(500, 600, { force: true })
    cy.get('.vessels > canvas').toMatchImageSnapshot({
      clip: { x: 300, y: 400, width: 500, height: 500 }
    })
  })
})
