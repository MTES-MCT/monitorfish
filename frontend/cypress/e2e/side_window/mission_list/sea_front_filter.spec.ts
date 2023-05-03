context('Side Window > Mission List > Sea Front Filter (= submenu)', () => {
  it('Should have the expected submenu counters', () => {
    cy.getDataCy('side-window-sub-menu-MED-number').should('have.text', '5')
    cy.getDataCy('side-window-sub-menu-NAMO-number').should('have.text', '2')
  })

  it('Should only show missions for MED sea front', () => {
    cy.get('.TableBodyRow').should('have.length.to.be.greaterThan', 0)
  })
})
