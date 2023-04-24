import { openSideWindowMissionList } from './utils'

// TODO Add search query, custom period and filter reset E2E tests.
context('Side Window > Mission List > Filter Bar', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should filter missions for the current year', () => {
    cy.fill('Période', 'Année en cours')

    cy.get('.TableBodyRow').should('have.length', 4)
    // Expected first row
    cy.get('[data-id="25"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should filter missions by source', () => {
    cy.fill('Origine', 'CACEM')

    cy.get('.TableBodyRow').should('have.length', 3)
    // Expected first row
    cy.get('[data-id="38"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should filter missions by status', () => {
    cy.fill('Statut', ['Terminée'])

    cy.get('.TableBodyRow').should('have.length', 1)
    // Expected first row
    cy.get('[data-id="43"]').should('exist')
  })

  it('Should filter missions by administration', () => {
    cy.fill('Administration', ['DREAL'])

    cy.get('.TableBodyRow').should('have.length', 1)
    // Expected first row
    cy.get('[data-id="43"]').should('exist')
  })

  it('Should filter missions by unit', () => {
    cy.fill('Unité', ['BGC Ajaccio'])

    cy.get('.TableBodyRow').should('have.length', 0)
  })

  it('Should filter missions by type', () => {
    cy.fill('Type de mission', ['Terre'])

    cy.get('.TableBodyRow').should('have.length', 2)
    // Expected first row
    cy.get('[data-id="25"]').should('exist')
    // Expected last row
    cy.get('[data-id="38"]').should('exist')
  })
})
