context('Main Window > Control Unit List Dialog', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit(`/`)
    cy.wait(2000)

    cy.clickButton('Liste des unités de contrôle')
  })

  it('Filters', () => {
    /**
     * Should show all control units by default
     */
    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 11)
    cy.contains('PAM Jeanne Barret').should('exist')
    cy.contains('ULAM 56').should('exist')

    /**
     * Should find control units matching the search query
     */
    cy.fill('Rechercher une unité', 'lorient')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 3)
    cy.contains('BSL Lorient').should('exist')
    cy.contains('BGC Lorient - DF 36 Kan An Avel').should('exist')
    cy.fill('Rechercher une unité', undefined)

    /**
     * Should find control units matching the selected administration
     */
    cy.fill('Administration', 'Douane')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 1)
    cy.contains('BGC Lorient - DF 36 Kan An Avel').should('exist')
    cy.fill('Administration', undefined)

    /**
     * Should find control units matching the selected resource category
     */
    cy.fill('Catégorie de moyen', ['Maritime'])

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 9)

    cy.contains('PAM Jeanne Barret').should('exist')
    cy.contains('ULAM 56').should('exist')
    cy.fill('Catégorie de moyen', undefined)

    /**
     * Should find control units matching the selected resource type
     */
    cy.fill('Type de moyen', 'Semi-rigide')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 4)
    cy.contains('BSL Lorient').should('exist')
    cy.contains('ULAM 56').should('exist')
    cy.fill('Type de moyen', undefined)

    /**
     * Should find control units matching the selected base
     */
    cy.fill('Base du moyen', 'Vannes')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 6)
    cy.contains('Cultures marines 56').should('exist')
    cy.contains('ULAM 56').should('exist')
  })
})
