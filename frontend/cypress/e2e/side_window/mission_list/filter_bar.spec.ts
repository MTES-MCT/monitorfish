import { openSideWindowMissionList } from './utils'
import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'

// TODO Add search query, custom period and filter reset E2E tests.
context('Side Window > Mission List > Filter Bar', () => {
  // By default, the mission list is filtered from the start of month
  const currentMonth = encodeURIComponent(getUtcizedDayjs().utc().startOf('month').toISOString())

  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should filter missions for the current year', () => {
    const currentYear = encodeURIComponent(getUtcizedDayjs().utc().startOf('year').toISOString())
    cy.intercept('GET', `/bff/v1/missions?&startedAfterDateTime=${currentYear}*`).as('getMissions')
    cy.fill('Période', 'Année en cours')
    cy.wait('@getMissions')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter missions by source', () => {
    cy.intercept(
      'GET',
      `/bff/v1/missions?&startedAfterDateTime=${currentMonth}&missionSource=MONITORENV&missionStatus=&missionTypes=&seaFronts=MED`
    ).as('getMissions')
    cy.fill('Origine', 'CACEM')
    cy.wait('@getMissions')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter missions by status', () => {
    cy.intercept(
      'GET',
      `/bff/v1/missions?&startedAfterDateTime=${currentMonth}&missionStatus=DONE&missionTypes=&seaFronts=MED`
    ).as('getMissions')
    cy.fill('Statut', ['Terminée'])
    cy.wait('@getMissions')

    cy.get('[data-cy="mission-list-filter-tags"]').contains('Terminée')
    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter missions by administration', () => {
    cy.fill('Administration', ['DREAL'])

    cy.get('[data-cy="mission-list-filter-tags"]').contains('DREAL')
    // This filter does the filtering in the frontend
    cy.get('.TableBodyRow').should('have.length', 1)
    // Expected first row
    cy.get('[data-id="43"]').should('exist')
  })

  it('Should filter missions by unit', () => {
    cy.fill('Unité', ['BGC Ajaccio'])

    cy.get('[data-cy="mission-list-filter-tags"]').contains('BGC Ajaccio')
    // This filter does the filtering in the frontend
    cy.get('.TableBodyRow').should('have.length', 0)
  })

  it('Should filter missions by type', () => {
    cy.intercept(
      'GET',
      `/bff/v1/missions?&startedAfterDateTime=${currentMonth}&missionStatus=&missionTypes=LAND&seaFronts=MED`
    ).as('getMissions')
    cy.fill('Type de mission', ['Terre'])
    cy.wait('@getMissions')

    cy.get('[data-cy="mission-list-filter-tags"]').contains('Terre')
    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })
})
