/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'
import {customDayjs} from "../../utils/customDayjs";

context('Vessel sidebar identity tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    openVesselBySearch('fr263418')
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-menu-identity"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="Type de navire"]').contains('Pêche côtière')
    cy.get('*[data-cy="Catégorie de navigation"]').contains('3')
    cy.get('*[data-cy="Genre de navigation"]').contains('Pêche')
    cy.get('*[data-cy="Engins de pêche déclarés (PME)"]').contains('Sennes danoises (SDN)')
    cy.get('*[data-cy="Engins de pêche déclarés (PME)"]').contains('Chaluts de fond à panneaux (OTB)')
    cy.get('*[data-cy="Engins de pêche déclarés (PME)"]').contains('Filets soulevés manœuvrés par bateau (LNB)')

    const today = customDayjs().utc().format('DD/MM/YYYY')
    cy.get('*[data-cy="Date d\'expiration"]').contains(today)

    cy.get('*[data-cy="Organisation de producteurs"]').contains('SA THO AN (depuis le 09/10/2017)')
    cy.get('*[data-cy="Coordonnées propriétaire"]').contains('DURAND')
    cy.get('*[data-cy="Coordonnées propriétaire"]').contains('+33 6 45 25 14')
    cy.get('*[data-cy="Coordonnées armateur"]').contains('DUPOND')
    cy.get('*[data-cy="Coordonnées armateur"]').contains('+33 6 84 56 32 14')
    cy.get('*[data-cy="Contact navire"]').contains('0918273645, +33 6 00 00 00 00')
    cy.get('*[data-cy="Contact navire"]').contains('escogriffe@dgse.spy, henri.duflot@dgse.spy')
  })
})
