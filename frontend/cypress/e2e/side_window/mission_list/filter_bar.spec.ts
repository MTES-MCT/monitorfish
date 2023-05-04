import { openSideWindowMissionList } from './utils'
import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'

// TODO Add search query, custom period and filter reset E2E tests.
context('Side Window > Mission List > Filter Bar', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should filter missions for the current day', () => {
    const currentDay = encodeURIComponent(getUtcizedDayjs().utc().startOf('day').toISOString())
    cy.intercept('GET', `/bff/v1/missions?&startedAfterDateTime=${currentDay}*`).as('getMissions')

    cy.fill('Période', 'Aujourd’hui')
    cy.wait('@getMissions')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter missions by source', () => {
    cy.intercept('GET', `*missionSource=MONITORENV*`).as('getMissions')
    cy.fill('Origine', 'CACEM')
    cy.wait('@getMissions')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter missions by status', () => {
    cy.intercept('GET', `*missionStatus=DONE&*`).as('getMissions')
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

  it('Should filter missions by unit When an administration filter is set', () => {
    cy.fill('Administration', ['Gendarmerie Maritime'])

    cy.get('[data-cy="mission-list-filter-tags"]').contains('Gendarmerie Maritime')
    cy.fill('Unité', ['P602 Verdon'])
    // There is only one unit in the unit select
    cy.get('.rs-checkbox-checker > label').should('have.length', 1)

    // This filter does the filtering in the frontend
    cy.get('.TableBodyRow').should('have.length', 0)
  })

  it('Should filter missions by unit', () => {
    cy.fill('Unité', ['BGC Ajaccio'])

    cy.get('[data-cy="mission-list-filter-tags"]').contains('BGC Ajaccio')
    // This filter does the filtering in the frontend
    cy.get('.TableBodyRow').should('have.length', 0)
  })

  it('Should filter missions by type', () => {
    cy.intercept('GET', `*missionTypes=LAND*`).as('getMissions')
    cy.fill('Type de mission', ['Terre'])
    cy.wait('@getMissions')

    cy.get('[data-cy="mission-list-filter-tags"]').contains('Terre')
    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })
})
