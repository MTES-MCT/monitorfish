/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Vessel sidebar resume tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    openVesselBySearch('Pheno')

    // Then
    cy.get('*[data-cy^="vessel-name"]').contains('PHENOMENE (FR)')
    cy.get('*[data-cy^="global-risk-factor"]').contains('2.5')

    cy.get('*[data-cy^="impact-risk-factor"]').contains('2.1')
    cy.get('*[data-cy^="impact-risk-factor"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="Zones de la marée"]').contains('27.8.b, 27.8.c')
    cy.get('*[data-cy="Engin de la marée (FAR)"]').contains('Chaluts de fond à panneaux (OTB)')
    cy.get('*[data-cy="Majorité d\'espèces à bord"]').contains('Pélagique')
    cy.get('*[data-cy="Espèces cibles à bord"]').contains('NEP (≥ 20% du total des captures)')

    cy.get('*[data-cy^="probability-risk-factor"]').contains('2.0')
    cy.get('*[data-cy^="probability-risk-factor"]').click({ force: true, timeout: 10000 })

    cy.get('*[data-cy^="detectability-risk-factor"]').contains('3.0')
    cy.get('*[data-cy^="detectability-risk-factor"]').click({ force: true, timeout: 10000 })

    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar-beacon-malfunction"]').contains('NON-ÉMISSION VMS')

    cy.get('*[data-cy^="risk-factor-priority-level"]').contains('2.6 – élevée')

    cy.get('*[data-cy^="show-risk-factor-explanation-modal"]').click({ force: true, timeout: 10000 })
  })

  it('An alert should be shown on the vessel sidebar', () => {
    // When
    cy.get('*[data-cy^="vessel-search-input"]').type('tempete couleur')
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-sidebar-alert"]').contains('Pêche en ZEE française par un navire tiers', {
      timeout: 10000
    })
  })
})
