/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('InterestPoint', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('An interest point Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })

    // Then
    cy.get('*[data-cy^="interest-point-name-input"]').type('Phénomène')
    cy.get('*[data-cy^="interest-point-observations-input"]').type('Est dans la bergerie')

    cy.get('*[data-cy^="interest-point-name"]').first().contains('Phénomène', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains('Est dans la bergerie', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47° 4', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('N', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('007° 5', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('W', { timeout: 20000 })

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
  })

  it('Multiple interest points Should be created When clicking on the map', () => {
    // When
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('*[data-cy="save-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').eq(0).contains('Est dans la bergerie', { timeout: 20000 })
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 1)

    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 20000 }).eq(1).should('have.value', '__° __′ __″ _ ___° __′ __″ _')
    cy.get('#root').click(300, 430, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène 2')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est encore dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('*[data-cy="save-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').eq(0).contains('Est encore dans la bergerie', { timeout: 20000 })
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 2)

    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 20000 }).eq(1).should('have.value', '__° __′ __″ _ ___° __′ __″ _')
    cy.get('#root').click(650, 690, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène 3')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est encore encore dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('*[data-cy="save-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').eq(0).contains('Est encore encore dans la bergerie', { timeout: 20000 })
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 3)
  })

  it('An interest Should be created from input When DD coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ timeout: 20000, force: true })
    cy.get('#root').click(159, 1000, { timeout: 20000 })
    cy.get('*[data-cy="coordinates-selection-dd"]').click({ timeout: 20000 })
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="coordinates-dd-input-lat"]').eq(1).type('47.5525')
    cy.get('*[data-cy^="coordinates-dd-input-lon"]').eq(1).type('-007.5563')

    cy.get('*[data-cy^="interest-point-name"]').first().contains('Aucun Libellé', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains('Aucune observation', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47.5525° -007.5499°', { timeout: 20000 })

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
    cy.get('*[data-cy="dmd-coordinates-input"]').eq(1).type('{backspace}{backspace}{backspace}{backspace}{backspace}500W')

    // Then
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47° 48.931′ N 007° 54.500′ W', { timeout: 20000 })
  })

  it('An interest Should be edited with East value When DMS coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ timeout: 20000, force: true })
    cy.get('#root').click(159, 1000, { timeout: 20000 })
    cy.get('*[data-cy="interest-point"]').click({ timeout: 20000 })
    cy.get('#root').click(490, 580, { timeout: 20000 })
    cy.get('*[data-cy="interest-point-type-radio-input"]').click({ timeout: 20000 })
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })
    cy.get('#root').click(536, 600, { timeout: 20000 })
    // The interest point is moved to the East side
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 20000 }).eq(1).type('{backspace}E')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })

    // Then
    cy.get('#root').click(536, 600, { timeout: 20000 })
    cy.get('*[data-cy="save-interest-point"]').should('not.be.visible')

    cy.get('*[data-cy="interest-point-edit"]').should('not.be.visible')
    cy.get('*[data-cy="interest-point-edit"]').click({ force: true })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 20000 }).eq(1).should('have.value', '47° 48′ 56″ N 007° 54′ 51″ E')
    cy.get('*[data-cy="interest-point-type-radio-input"]').should('have.class', 'rs-radio-checked')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47° 48′', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('N', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('007° 54′', { timeout: 20000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('E', { timeout: 20000 })
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
    cy.get('*[data-cy="interest-point-observations-input"]').should('have.value', '')
  })
})
