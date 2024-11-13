/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Vessel sidebar identity tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    openVesselBySearch('Pheno')
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-menu-identity"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-identity-gears"]').contains('Sennes danoises (SDN)')
    cy.get('*[data-cy^="vessel-identity-producerOrganization"]').contains('SA THO AN (adhésion le 14/03/2015)')
  })
})
