import { openSideWindowMissionList } from './utils'

context('Side Window > Mission List > Sea Front Filter (= submenu)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/bff/v1/missions?&missionStatus=&missionTypes=&seaFronts=MED').as('getMissions')
    openSideWindowMissionList()
    cy.wait('@getMissions')
  })

  it('Should have the expected submenu counters', () => {
    cy.getDataCy('side-window-sub-menu-MED-number').should('have.text', '5')
    cy.getDataCy('side-window-sub-menu-NAMO-number').should('have.text', '2')
  })

  it('Should only show missions for MED sea front', () => {
    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })

  it('Should only show missions for NAMO sea front', () => {
    cy.intercept('GET', '/bff/v1/missions?&missionStatus=&missionTypes=&seaFronts=NAMO').as('getMissions')
    cy.getDataCy('side-window-sub-menu-NAMO').click()
    cy.wait('@getMissions')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })
})
