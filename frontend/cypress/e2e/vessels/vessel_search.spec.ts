/* eslint-disable no-undef */

context('VesselSearch', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Vessel from last positions and vessels table Should be searched from the search bar', () => {
    // When searching a vessel from the last positions table
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // We should be able to search again when the vessel sidebar is already opened
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('détacher')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()

    // Close the sidebar
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 10000 }).should('not.exist')

    // Search a vessel in the vessel table
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('MALOTRU')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).contains('MALOTRU')
  })

  it('Vessel history Should be shown When having previously searched vessels', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()

    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('détacher')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()

    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).click()

    // Then
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).should('have.length', 2)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).contains('DÉTACHER ROULER ÉCHAPPER')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(1).contains('PHENOMENE')

    // Reload page
    cy.reload()
    cy.get('*[data-cy^="first-loader"]', { timeout: 10000 }).should('not.exist')

    // Vessels should be kept in list
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).should('have.length', 2)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).contains('DÉTACHER ROULER ÉCHAPPER')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(1).contains('PHENOMENE')
  })

  it('Vessel Should be searched from the search bar with few positions When a beacon number is entered', () => {
    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('FGED')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 10000 })
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains(
      '14 nds',
      { timeout: 10000 }
    )
  })
})
