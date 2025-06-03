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

    cy.clickButton('Fermer')
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    /**
     * An alert should be shown on the vessel sidebar
     */
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

  it('Groups may be displayed, added and removed', () => {
    // When
    openVesselBySearch('tempete couleur')
    cy.wait(500)

    // Add a group
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselTwo')
    cy.fill('Ajouter le navire à un groupe fixe', ['Mission Thémis – semaine 04'])
    cy.wait('@updateVesselTwo')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .scrollIntoView()
      .should('exist')
    cy.wait(200)

    // Remove the vessel from the group
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselThree')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]').next().click({ force: true })
    cy.wait('@updateVesselThree')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .should('not.exist')
    cy.wait(200)

    // Re-add a group
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselFour')
    cy.fill('Ajouter le navire à un groupe fixe', ['Mission Thémis – semaine 04'])
    cy.wait('@updateVesselFour')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .scrollIntoView()
      .should('exist')
    cy.wait(200)

    // Re-remove the vessel from the group (checkpicker)
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselFive')
    cy.get('[id="vesselGroups"]').scrollIntoView().click({ force: true})
    cy.get('[title="Mission Thémis – semaine 04"]').scrollIntoView().click({ force: true})
    cy.wait('@updateVesselFive')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .should('not.exist')
  })

  it('Vessel profile must be displayed', () => {
    // When
    openVesselBySearch('ABC000022984')

    cy.getDataCy('vessel-profile').contains('Profil du navire').scrollIntoView()

    // Gear
    // The scrollbar in Cypress is 6px width (in dev mode in Firefox the width is 422px)
    cy.get('[title="OTB (100.0%)"]')
      .should('have.css', 'width', '416px')
      .contains('OTB (100.0%)')

    // Species
    cy.get('[title="MNZ (73.4%)"]')
      .should('have.css', 'width', '303px')
      .contains('MNZ (73.4%)')
    cy.get('[title="LEZ (9.7%)"]')
      .should('have.css', 'width', '31px')
      .contains('LEZ')
    cy.get('[title="JOD (5.8%)"]')
      .should('have.css', 'width', '15px')
      .contains('JOD')
    cy.get('[title="WIT (3.0%)"]')
      .should('have.css', 'width', '3px')
      .and('have.prop', 'innerText', '')
    cy.get('[title="Autres (8.1%)"]')
      .should('have.css', 'width', '25px')
      .contains('Autres')

    // Fao zones
    cy.get('[title="27.7.b (98.2%)"]')
      .should('have.css', 'width', '408px')
      .contains('27.7.b (98.2%)')
    cy.get('[title="27.7.c.2 (1.8%)"]')
      .should('have.css', 'width', '0px')
      .and('have.prop', 'innerText', '')

    // Landing ports
    cy.get('[title="Brest (100.0%)"]')
      .should('have.css', 'width', '416px')
      .contains('Brest (100.0%)')
  })
})
