/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Backoffice', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/regulation`)
    cy.wait(200)
  })

  it('regulatory zones are displayed by layer name and law types', () => {
    cy.get('[data-cy="law-type"]').should('have.length', 3)
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

  it('on mouse over layer name edit button appears', () => {
    // Given
    // listen Post request to /geoserver/wfs
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')

    cy.get('[data-cy="Reg. MEMN"]').eq(0).click()
    cy.get('[title="Ouest Cotentin Bivalves"]').eq(0).trigger('mouseover', { force: true })
    cy.get('[data-cy="regulatory-layername-edit"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layername-edit"]').eq(0).click()
    cy.get('[data-cy="layer-name-input"]').should('have.length', 1)
    cy.get('[data-cy="layer-name-input"]').eq(0).type(' - changed')

    // When
    cy.get('[data-cy="layer-name-input"]').eq(0).type('{enter}')
    cy.get('[data-cy="layer-name-input"]').should('not.exist')

    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(request.body).contain('typeName="monitorfish:regulations_write"')
        expect(request.body).contain('<Value>Ouest Cotentin Bivalves - changed</Value>')
        expect(response.statusCode).equal(200)
      })

    // Then
    cy.get('[data-cy="regulatory-layers-my-zones-topic"]').then(elements => {
      expect(elements.eq(0)).contain("Ouest Cotentin Bivalves - changed")
      expect(elements.eq(0).parent()).contain("1/1")
    })
  })
})
