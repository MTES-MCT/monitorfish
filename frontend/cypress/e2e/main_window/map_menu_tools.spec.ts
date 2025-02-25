import { openVesselBySearch } from './utils'

context('Map menu tools', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(2000)
  })

  it('Opening a tool should close the previous tool opened and open the selected tool', () => {
    // When
    openVesselBySearch('Pheno')
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
    cy.get('body').contains('Afficher depuis').should('be.visible')

    // Vessel filters
    cy.get('*[data-cy="vessel-filters"]').click({ timeout: 10000 })
    cy.get('body').contains('Afficher depuis').should('not.be.visible')
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
