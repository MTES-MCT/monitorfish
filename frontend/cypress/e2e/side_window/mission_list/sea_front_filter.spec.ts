/// <reference types="cypress" />

import { openSideWindowMissionList } from './utils'

context('Side Window > Mission List > Sea Front Filter (= submenu)', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should have the expected submenu counters', () => {
    cy.getDataCy('side-window-sub-menu-MEMN-number').should('have.text', '9')
    cy.getDataCy('side-window-sub-menu-NAMO-number').should('have.text', '2')
  })

  it('Should only show missions for MEMN sea front', () => {
    cy.get('.TableBodyRow').should('have.length', 9)
    // Expected first row
    cy.get('[data-id="2"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })

  it('Should only show missions for NAMO sea front', () => {
    cy.getDataCy('side-window-sub-menu-NAMO').click()

    cy.get('.TableBodyRow').should('have.length', 2)
    // Expected first row
    cy.get('[data-id="38"]').should('exist')
    // Expected last row
    cy.get('[data-id="49"]').should('exist')
  })
})
