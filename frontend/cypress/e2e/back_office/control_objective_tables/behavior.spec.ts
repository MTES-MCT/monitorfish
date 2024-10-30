/* eslint-disable no-undef */

context('BackOffice > Control Objective Tables > Behavior', () => {
  beforeEach(() => {
    const currentYear = new Date().getFullYear()

    cy.intercept('GET', `/bff/v1/fleet_segments/${currentYear}`).as('fleetSegments')
    cy.intercept('GET', `/bff/v1/admin/control_objectives/${currentYear}`).as('controlObjectives')

    cy.login('superuser')

    cy.visit('/backoffice/control_objectives')
    cy.wait('@fleetSegments')
    cy.wait('@controlObjectives')
  })

  it('Should permit to add a control objective year When the current year is not yet added', () => {
    // Given
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    const now = new Date(nextYear, 3, 14).getTime()

    cy.clock(now)
    cy.get('.rs-table-row').should('have.length', 67)
    cy.get('*[data-cy^="control-objectives-year"]').contains(currentYear)
    cy.get('*[data-cy^="control-objectives-year"]').click()
    cy.get('.rs-picker-select-menu-item').should('have.length', 2)

    // Then
    cy.get('*[data-cy="control-objectives-add-year"]').contains(nextYear)
  })
})
