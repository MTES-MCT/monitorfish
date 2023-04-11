context('Map menu tools', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Opening a tool should close the previous tool opened and open the selected tool', () => {
    // When
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.get('#root').click(880, 760, { timeout: 10000 })

    // Measurement
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').should('be.visible')

    // Interest point
    cy.get('*[data-cy="interest-point"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').should('not.be.visible')
    cy.get('*[data-cy="interest-point-name-input"]').should('be.visible')

    // Vessel label
    cy.get('*[data-cy="vessel-labels"]').click({ timeout: 10000 })
    cy.get('*[data-cy="interest-point-name-input"]').should('not.be.visible')
    cy.get('*[data-cy="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("étiquettes des navires")')
      .should('be.visible')

    // Vessel visibility
    cy.get('*[data-cy="vessel-visibility"]').click({ timeout: 10000 })
    cy.get('*[data-cy="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("étiquettes des navires")')
      .should('not.be.visible')
    cy.get('*[data-cy="global-vessel-track-depth-twelve-hours"]').should('be.visible')

    // Vessel filters
    cy.get('*[data-cy="vessel-filters"]').click({ timeout: 10000 })
    cy.get('*[data-cy="global-vessel-track-depth-twelve-hours"]').should('not.be.visible')
    cy.get('*[data-cy="vessel-filters-create-new-filter"]').should('be.visible')

    // Press on ESC should close the tool and shrink the menu
    cy.get('*[data-cy="vessel-filters"]').should('have.css', 'width', '40px')
    cy.get('body').type('{esc}')
    cy.get('*[data-cy="vessel-filters"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="vessel-visibility"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="vessel-labels"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="interest-point"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '5px')
    cy.get('*[data-cy="vessel-list"]').should('have.css', 'width', '5px')
  })
})
