import { openSideWindowMissionList } from './utils'

context('Side Window > Mission List > Sea Front Filter (= submenu)', () => {
  it('Should have the expected submenu counters', () => {
    openSideWindowMissionList()
    cy.getDataCy('side-window-sub-menu-MED-number').should('have.text', '5')
    cy.getDataCy('side-window-sub-menu-NAMO-number').should('have.text', '2')

    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })
})
