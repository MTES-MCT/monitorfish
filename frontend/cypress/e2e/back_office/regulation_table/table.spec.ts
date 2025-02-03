/* eslint-disable no-undef */

context('BackOffice > Regulation Table > Table', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/backoffice/regulation')
    cy.wait(1000)
  })

  it('regulatory zones are displayed by layer name and law schemas', () => {
    cy.get('[data-cy="backoffice-search-regulation"]').type('dra')
    cy.get('[data-cy="Reg. NAMO"]').eq(0).click()
    cy.get('[data-cy="backoffice-search-regulation"]').type('{backspace}{backspace}{backspace}')
    cy.get('[data-cy="law-type"]').should('have.length', 4)
    // test Reg. MEMN values
    cy.get('[data-cy="Reg. MEMN"]').should('have.length', 1)
    cy.get('[data-cy="Reg. MEMN"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[title="Ouest Cotentin Bivalves"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click({ force: true })
    cy.get('[title="Praires Ouest cotentin"]').should('exist')
    // test Reg. NAMO values
    cy.get('[data-cy="Reg. NAMO"]').should('have.length', 1)
    cy.get('[data-cy="Reg. NAMO"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[title="Armor CSJ Dragues"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click({ force: true })
    cy.get('[title="Secteur 3"]').should('exist')
    // test Reg. Outre Mer values
    cy.get('[data-cy="Reg. Outre-mer"]').should('have.length', 1)
    cy.get('[data-cy="Reg. Outre-mer"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[title="Mayotte Poulpes"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click({ force: true })
    cy.get('[title="Poulpes Mayotte"]').should('exist')
  })
})
