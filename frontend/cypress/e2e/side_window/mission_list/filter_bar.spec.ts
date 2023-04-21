import { openSideWindowMissionList } from './utils'

// TODO Add search query, custom period and filter reset E2E tests.
context('Side Window > Mission List > Filter Bar', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should filter missions for the current year', () => {
    cy.fill('Période', 'Année en cours')

    cy.get('.TableBodyRow').should('have.length', 7)
    // Expected first row
    cy.get('[data-id="24"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should filter missions by source', () => {
    cy.fill('Origine', ['CACEM'])

    cy.get('[data-id="24"]').should('exist')
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should filter missions by status', () => {
    cy.fill('Status', ['Terminée'])

    cy.get('[data-id="2"]').should('exist')
    cy.get('[data-id="45"]').should('exist')
  })

  it('Should filter missions by administration', () => {
    cy.fill('Administration', ['Douane'])

    cy.get('.TableBodyRow').should('have.length', 5)
    // Expected first row
    cy.get('[data-id="2"]').should('exist')
    // Expected last row
    cy.get('[data-id="45"]').should('exist')
  })

  it('Should filter missions by unit', () => {
    cy.fill('Unité', ['DML 2A'])

    cy.get('.TableBodyRow').should('have.length', 3)
    // Expected first row
    cy.get('[data-id="38"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should filter missions by type', () => {
    cy.fill('Type de mission', ['Terre'])

    cy.get('.TableBodyRow').should('have.length', 2)
    // Expected first row
    cy.get('[data-id="34"]').should('exist')
    // Expected last row
    cy.get('[data-id="38"]').should('exist')
  })
})
