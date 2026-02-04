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
    cy.get('#root').click(880, 760, { timeout: 10000 })

    // Measurement should close the vessel sidebar
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '5px')
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').should('be.visible')
    cy.getDataCy('vessel-sidebar').should('not.exist')

    // Interest point
    cy.clickButton("Créer un point d'intérêt", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-radius-input"]').should('not.exist')
    cy.get('*[data-cy="interest-point-name-input"]').should('be.visible')

    // Vessel visibility
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.get('*[data-cy="interest-point-name-input"]').should('not.exist')
    cy.get('*[data-cy="map-property-trigger"]', { timeout: 10000 })
      .filter(':contains("étiquettes des navires")')
      .should('be.visible')
    cy.get('body').contains('Afficher depuis').should('be.visible')

    // Vessel groups
    cy.clickButton('Groupes de navires', { withoutScroll: true })
    cy.get('body').contains('Afficher depuis').should('not.exist')
    cy.getDataCy('vessel-groups-menu-box').should('be.visible')

    // Account
    cy.clickButton('Mon compte', { withoutScroll: true })
    cy.getDataCy('vessel-groups-menu-box').should('not.exist')
    cy.get('*[data-cy="map-account-box"]').should('be.visible')

    // Account
    cy.clickButton("Nouveautés MonitorFish", { withoutScroll: true })
    cy.get('*[data-cy="map-account-box"]').should('not.exist')
    cy.getDataCy('map-new-features-box').should('be.visible')

    // Press on ESC should close the tool
    cy.get('[aria-label="Nouveautés MonitorFish"]').should('have.css', 'width', '40px')
    cy.get('body').type('{esc}')
    cy.get('[aria-label="Nouveautés MonitorFish"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="vessel-visibility"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="interest-point"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="measurement"]').should('have.css', 'width', '40px')
    cy.get('*[data-cy="vessel-list"]').should('have.css', 'width', '40px')
  })
})
