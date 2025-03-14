/* eslint-disable no-undef */

context('VesselSearch', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Vessel from last positions and vessels table Should be searched from the search bar', () => {
    // When searching a vessel from the last positions table
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('firstVessel')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait('@firstVessel')
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // We should be able to search again when the vessel sidebar is already opened
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('détacher')
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('secondVessel')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait('@secondVessel')

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
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('firstVessel')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait('@firstVessel')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()

    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('détacher')

    cy.intercept('GET', `/bff/v1/vessels/find*`).as('secondVessel')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait('@secondVessel')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()

    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).click()

    // Then
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).should('have.length', 2)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).contains('DÉTACHER ROULER ÉCHAPPER')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(1).contains('PHENOMENE')

    // Reload page
    cy.wait(500)
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
    cy.get('[data-id="2"] > td').eq(2).contains('14 nds')
  })
})
