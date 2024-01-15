context('Main Window > Control Unit List Dialog > Filters', () => {
  beforeEach(() => {
    cy.visit(`/`).wait(1000)

    cy.clickButton('Liste des unités de contrôle')
  })

  it('Should show all control units by default', () => {
    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 11)
    cy.contains('PAM Jeanne Barret').should('exist')
    cy.contains('ULAM 56').should('exist')
  })

  it('Should find control units matching the search query', () => {
    cy.fill('Rechercher une unité', 'lorient')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 3)
    cy.contains('BSL Lorient').should('exist')
    cy.contains('BGC Lorient - DF 36 Kan An Avel').should('exist')
  })

  it('Should find control units matching the selected administration', () => {
    cy.fill('Administration', 'Douane')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 1)
    cy.contains('BGC Lorient - DF 36 Kan An Avel').should('exist')
  })

  it('Should find control units matching the selected resource category', () => {
    cy.fill('Catégorie de moyen', ['Maritime'])

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 7)

    cy.contains('BGC Lorient - DF 36 Kan An Avel').should('exist')
    cy.contains('ULAM 56').should('exist')
  })

  it('Should find control units matching the selected resource type', () => {
    cy.fill('Type de moyen', 'Semi-rigide')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 4)
    cy.contains('BSL Lorient').should('exist')
    cy.contains('ULAM 56').should('exist')
  })

  it('Should find control units matching the selected base', () => {
    cy.fill('Base du moyen', 'Vannes')

    cy.getDataCy('ControlUnitListDialog-control-unit').should('have.length', 6)
    cy.contains('Cultures marines 56').should('exist')
    cy.contains('ULAM 56').should('exist')
  })
})
