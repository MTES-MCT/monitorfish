/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('LayersSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('A regulation Should be searched and added to My Zones', () => {
    // When
    cy.get('*[data-cy^="layers-sidebar"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy^="regulatory-layer-topic"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="regulatory-zone-check"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="regulatory-search-add-zones-button"]').contains('Ajouter 1 zone')
    cy.get('*[data-cy^="regulatory-search-add-zones-button"]').click()

    // Then it is in "My Zones"
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone"]').contains('Praires Ouest cotentin')

    // Delete the zone
    cy.get('*[data-cy="regulatory-layers-my-zones-zone-delete"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').should('not.exist');

    // Close the layers sidebar
    cy.get('*[data-cy^="layers-sidebar"]').click({ timeout: 20000 })
  })
})
