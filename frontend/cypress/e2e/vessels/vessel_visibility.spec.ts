context('Vessel visibility', () => {
  beforeEach(() => {
    cy.loadPath('/#@-487249.11,6076055.47,15.77')
  })

  it('Vessels at port Should be hidden and showed', () => {
    // Given
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    // When
    cy.get('*[data-cy="vessel-visibility"]').click()
    cy.get('*[data-cy="map-property-trigger"]')
      .filter(':contains("les navires au port")')
      .click({ force: true, timeout: 10000 })
    cy.wait(500)
    cy.get('#root').dblclick(560, 620, { timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 12)
  })

  it('Vessels default track depth Should be taken into account', () => {
    // Given
    cy.get('*[data-cy="vessel-visibility"]').click()
    cy.get('[data-cy="global-vessel-track-depth-one-week"] input').click()
    cy.get('*[data-cy="vessel-visibility"]').click()

    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click()
    cy.get('*[data-cy^="vessel-track-depth-one-week"]').should('have.class', 'rs-radio-checked')
  })
})
