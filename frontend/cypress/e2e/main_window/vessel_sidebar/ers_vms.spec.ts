/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Vessel sidebar ers/vms tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('ERS/VMS tab Should show information about vessel equipment', () => {
    // Given
    cy.get('input[placeholder="Rechercher un navire..."]').type('pheno')
    cy.contains('mark', 'PHENO').click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselBeaconMalfunctions')

    // When
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="N° balise VMS"]').contains('FGEDX85')
    cy.get('*[data-cy="Type de balise"]').contains('Côtier')
    cy.get('*[data-cy="Date loggage"]').contains('12/05/2021 à 12h23:00')
    cy.get('*[data-cy="Statut JPE"]').contains('Equipé')
    cy.get('*[data-cy="E-Sacapt"]').contains('Non')
    cy.get('*[data-cy="VisioCaptures"]').contains('Oui')
    cy.get('*[data-cy="Logiciel JPE"]').contains('JT/VISIOCaptures V1.4.7')
  })

  it('ERS/VMS tab Should not throw When a beacon is missing', () => {
    // Given
    cy.get('input[placeholder="Rechercher un navire..."]').type('MERLU')
    cy.contains('mark', 'MERLU').click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselBeaconMalfunctions')

    // When
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 10000 })

    // Then, it does not throw
  })

  it('ERS/VMS tab Should contain history of beacon malfunctions and show a malfunction detail in history', () => {
    // Given
    openVesselBySearch('Pheno')
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselBeaconMalfunctions')

    // When
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-beacon-malfunctions"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="vessel-equipments"]', { timeout: 10000 }).should('be.visible')

    // Then
    cy.wait('@vesselBeaconMalfunctions').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 10000 }).contains('à quai 1')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-last"]', { timeout: 10000 }).contains('Activité détectée')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 10000 })
      .children()
      .eq(0)
      .contains('1 avarie en mer')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 10000 })
      .children()
      .eq(0)
      .contains('0 avarie à quai')
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 10000 }).children().eq(0).click()
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 10000 })
      .children()
      .eq(1)
      .contains('Aucune avarie')

    // See the details of a beacon malfunction
    cy.get('*[data-cy="vessel-beacon-malfunction-single-history"]', { timeout: 10000 }).click({ force: true })
    cy.get('*[data-cy="vessel-malfunctions-details"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 10000 }).contains('0 commentaire')
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 10000 }).contains(
      'Avarie en mer ouverte dans MonitorFish, dernière émission le'
    )
    cy.get('*[data-cy="beacon-malfunction-details-follow-up"]', { timeout: 10000 }).contains(
      'Le ticket a été déplacé de Premier contact à Avaries clôturées.'
    )
    cy.get('*[data-cy="beacon-malfunction-details"]', { timeout: 10000 }).contains('Navire en mer')
    cy.get('*[data-cy="beacon-malfunction-details"]', { timeout: 10000 }).contains('14 jours')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  it('ERS/VMS tab Should contain current and history of beacon malfunctions', () => {
    // Go to the detail of a beacon malfunction and go back to resume
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
    ).as('openVessel')
    openVesselBySearch('Pheno')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-menu-ers-vms"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-beacon-malfunctions-history"]', { timeout: 10000 }).children().eq(0).click()
    cy.get('*[data-cy="vessel-beacon-malfunction-single-history"]', { timeout: 10000 }).click({ force: true })
    cy.get('*[data-cy="beacon-malfunction-back-to-resume"]', { timeout: 10000 }).click()
    cy.get('*[data-cy="vessel-equipments"]', { timeout: 10000 }).should('be.visible')

    // See current beacon malfunction
    cy.get('*[data-cy="beacon-malfunction-current-see-details"]', { timeout: 10000 }).click()
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 10000 }).contains('Activité détectée')

    // Search for another vessel
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=TALK2ME' +
      '&internalReferenceNumber=U_W0NTFINDME&IRCS=QGDF&trackDepth=TWELVE_HOURS' +
      '&vesselId=2&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
    ).as('openVesselTwo')
    cy.intercept('GET', '/bff/v1/vessels/beacon_malfunctions*').as('vesselTwoBeaconMalfunctions')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('U_W0')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait('@openVesselTwo')
    cy.wait('@vesselTwoBeaconMalfunctions').then(({ response }) => expect(response && response.statusCode).equal(200))

    // Then
    cy.get('*[data-cy="vessel-equipments"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="vessel-beacon-malfunctions"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 10000 }).contains('à quai 0')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-number"]', { timeout: 10000 }).contains('en mer 1')
    cy.get('*[data-cy="vessel-beacon-malfunctions-resume-last"]', { timeout: 10000 }).contains('Sans nouvelles')

    // See current beacon malfunction of new vessel
    cy.get('*[data-cy="beacon-malfunction-current-see-details"]', { timeout: 10000 }).click()
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="beacon-malfunction-current-details"]', { timeout: 10000 }).contains('Sans nouvelles')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })
})
