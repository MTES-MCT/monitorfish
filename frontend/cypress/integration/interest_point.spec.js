/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('InterestPoint', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('An interest Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })

    // Then
    cy.get('*[data-cy^="interest-point-name-input"]').type('Phénomène')
    cy.get('*[data-cy^="interest-point-observations-input"]').type('Est dans la bergerie')

    cy.get('*[data-cy^="interest-point-name"]').first().contains("Phénomène", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains("Est dans la bergerie", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("47° 4", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("N", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("007° 5", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("W", { timeout: 20000 })

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
  })

  it('An interest Should be created from input When DD coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ timeout: 20000, force: true })
    cy.get('#root').click(159, 1000, { timeout: 20000 })
    cy.get('*[data-cy="coordinates-selection-dd"]').click({ timeout: 20000 })
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="interest-point-coordinates-dd-input-lat"]').type('47.5525')
    cy.get('*[data-cy^="interest-point-coordinates-dd-input-lon"]').type('-007.5563')

    cy.get('*[data-cy^="interest-point-name"]').first().contains("Aucun Libellé", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains("Aucune observation", { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("47.5525° -007.5499°", { timeout: 20000 })

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
  })

  it('An interest Should be edited When DMD coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ timeout: 20000, force: true })
    cy.get('#root').click(159, 1000, { timeout: 20000 })
    cy.get('*[data-cy="coordinates-selection-dmd"]').click({ timeout: 20000 })

    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('*[data-cy="interest-point-edit"]').click({ timeout: 20000 })
    cy.get('*[data-cy="test"]').type('{backspace}{backspace}{backspace}{backspace}{backspace}500W')

    // Then
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains("47° 48.933′ N 007° 54.500′ W", { timeout: 20000 })
  })

  it('An interest Should be deleted When it is in edit mode', () => {
    // When
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('*[data-cy="interest-point-edit"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="interest-point-observations-input"]').type('Est dans la bergerie')
    cy.get('*[data-cy="interest-point-delete"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="interest-point-observations-input"]').should('have.value', '');
  })
})
