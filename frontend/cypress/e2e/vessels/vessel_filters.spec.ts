context('Vessel filters', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('A Filter Should be created and added on the map', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-list-country-filter"]').click({ force: true })
    cy.get('*[data-cy="select-picker-menu-item-France"]').scrollIntoView().click()
    cy.wait(200)
    cy.get('*[data-cy="vessel-list-fleet-segment-filter"]').click({ force: true })
    cy.get('*[data-cy^="select-picker-menu-item-NWW01/02"]').scrollIntoView().click()
    cy.wait(200)
    cy.get('.rs-picker-search-input').eq(3).type('HKE{enter}')

    // When
    cy.get('*[data-cy^="save-filter-modal"]').click({ timeout: 10000 })
    cy.get('[name="vessel-filter"]').type('Navires FR')
    cy.get('*[data-cy="save-filter"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="vessel-filters"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-filter"]').first().contains('Navires FR', { timeout: 10000 })
    cy.get('*[data-cy="vessel-filter"]').first().click({ timeout: 10000 })

    cy.get('*[data-cy="vessel-filter-tag"]').eq(0).contains('France', { timeout: 10000 })
    cy.get('*[data-cy="vessel-filter-tag"]').eq(1).contains('HKE', { timeout: 10000 })
    cy.get('*[data-cy="vessel-filter-tag"]').eq(2).contains('NWW01/02', { timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 18)
    cy.get('*[data-cy^="map-property-trigger"]').filter(':contains("les autres navires")').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 3)

    // Remove tags
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(2).click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(1).click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(0).click({ timeout: 10000 })

    // We should have ~ the same number of labels than in init
    cy.get('*[data-cy^="map-property-trigger"]').filter(':contains("les autres navires")').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length.to.be.greaterThan', 5)
  })
})
