import { openSideWindowMissionList } from './utils'

context('Side Window > Mission List > Sea Front Filter (= submenu)', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should have the expected submenu counters', () => {
    cy.getDataCy('side-window-sub-menu-ALL-number').should('have.text', '15')
    cy.getDataCy('side-window-sub-menu-MED-number').should('have.text', '3')
    cy.getDataCy('side-window-sub-menu-MEMN-number').should('have.text', '7')
  })

  it('Should only show missions for MED sea front', () => {
    cy.get('.TableBodyRow').should('have.length', 3)
    // Expected first row
    cy.get('[data-id="6"]').should('exist')
    cy.get('[data-id="25"]').should('exist')
    cy.get('[data-id="43"]').should('exist')
  })

  it('Should filter for ALL missions', () => {
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()

    cy.get('.TableBodyRow').should('have.length', 15)
  })
})
