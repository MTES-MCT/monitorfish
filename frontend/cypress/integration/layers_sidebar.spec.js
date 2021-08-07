/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('LayersSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)

    cy.window().then((win) => {
       console.log(win.env)
    })
    
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

  it('A regulation metadata Should be opened', () => {
    // When
    cy.get('*[data-cy^="layers-sidebar"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy^="regulatory-layer-topic"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="regulatory-zone-check"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="regulatory-search-add-zones-button"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()

    // Then show the metadata
    cy.get('*[data-cy="regulatory-layers-show-metadata"]').click()
    cy.get('*[data-cy="regulatory-layers-metadata-seafront"]').contains('MEMN')
    cy.get('*[data-cy="regulatory-layers-metadata-gears"]').contains('Dragues remorquées par bateau (DRB)')
  })

  it('An advanced search Should filter the search result', () => {
    // When
    cy.get('*[data-cy^="layers-sidebar"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layers-advanced-search"]').click()

    cy.get('*[data-cy^="regulatory-layers-advanced-search-zone"]').type('MEMN')
    cy.get('*[data-cy^="regulatory-layers-advanced-search-gears"]').type('DRB')
    cy.get('*[data-cy^="regulatory-layers-advanced-search-species"]').type('VEV')
    cy.get('*[data-cy^="regulatory-layer-topic"]').contains('Ouest Cotentin Bivalves')
  })
})
