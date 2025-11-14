/* eslint-disable no-undef */

import { customDayjs } from '../../utils/customDayjs'
import { openVesselBySearch } from '../utils'

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
    cy.get('*[data-cy="Contact navire"]').contains('0918273645')
    cy.get('*[data-cy="Contact navire"]').contains('+33 6 00 00 00 00')
    cy.get('*[data-cy="Contact navire"]').contains('escogriffe@dgse.spy')
    cy.get('*[data-cy="Contact navire"]').contains('henri.duflot@dgse.spy')
  })

  it('Identity should modify contact method', () => {
    // Given
    cy.intercept('POST', `/bff/v1/vessels/contact_method`).as('createContactMethod')
    cy.intercept('PUT', `/bff/v1/vessels/contact_method`).as('updateContactMethod')
    openVesselBySearch('fr263418')
    cy.clickButton('Identité')

    // When creating a vessel contact
    cy.fill("Modalité de contact avec l'unité", 'Nouvelle modalité de contact')
    cy.fill('Contact à mettre à jour', true)
    cy.clickButton('Valider')

    // Then
    cy.wait('@createContactMethod').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        contactMethod: 'Nouvelle modalité de contact',
        contactMethodShouldBeChecked: true,
        vesselId: 3
      })
    })

    // When cancelling modifications
    cy.fill("Modalité de contact avec l'unité", 'Autre modalité de contact')
    cy.fill('Contact à mettre à jour', false)
    cy.clickButton('Annuler')
    // Then
    cy.get('#contactMethod').should('have.value', 'Nouvelle modalité de contact')

    // When updating a vessel contact method
    cy.fill("Modalité de contact avec l'unité", 'Autre modalité de contact')
    cy.fill('Contact à mettre à jour', false)
    cy.clickButton('Valider')
    // Then
    cy.wait('@updateContactMethod').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        contactMethod: 'Autre modalité de contact',
        contactMethodShouldBeChecked: false,
        vesselId: 3
      })
    })
  })
})
