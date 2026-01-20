/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Vessel sidebar resume tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it.only('Resume Should be opened When clicking on a vessel', () => {
    // When
    openVesselBySearch('Pheno')

    // Then
    cy.getDataCy('vessel-name').contains('PHENOMENE (FR)')
    cy.getDataCy('global-risk-factor').contains('2.5')

    cy.getDataCy('impact-risk-factor').contains('2.1')
    cy.getDataCy('impact-risk-factor').click({ force: true, timeout: 10000 })
    cy.get(
      '[title="Segment(s) actuel(s) à partir des messages de captures\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')
    cy.get('*[data-cy="Zones de la marée"]').contains('27.8.b, 27.8.c')
    cy.get('*[data-cy="Engin de la marée (FAR)"]').contains('Chaluts de fond à panneaux (OTB)')
    cy.get('*[data-cy="Majorité d\'espèces à bord"]').contains('Pélagique')
    cy.get('*[data-cy="Espèces cibles à bord"]').contains('NEP (≥ 20% du total des captures)')

    cy.getDataCy('probability-risk-factor').contains('2.0')
    cy.getDataCy('probability-risk-factor').click({ force: true, timeout: 10000 })
    cy.getDataCy('probability-risk-factor').next().contains('Probabilité d’infraction du segment')
    cy.getDataCy('risk-factor-infringementRiskLevel').contains('2.0 – moyenne')
    cy.getDataCy('probability-risk-factor').next().contains('Fréquence d’infraction du navire')
    cy.getDataCy('risk-factor-infractionRateRiskFactor').contains('2.0 – Infractions occasionnelles')
    cy.getDataCy('probability-risk-factor').next().contains('8 contrôles sur 5 ans ')
    cy.getDataCy('probability-risk-factor').next().contains('5 infractions pêche / 8 contrôles')

    cy.getDataCy('detectability-risk-factor').contains('3.0')
    cy.getDataCy('detectability-risk-factor').click({ force: true, timeout: 10000 })
    cy.getDataCy('detectability-risk-factor').next().contains('Priorité du segment')
    cy.getDataCy('risk-factor-priority-level').contains('2.6 – élevée')
    cy.getDataCy('detectability-risk-factor').next().contains('Priorité du navire')
    cy.getDataCy('detectability-risk-factor').next().contains('3.8 – Contrôles rares')

    cy.wait(200)
    cy.getDataCy('vessel-sidebar-beacon-malfunction').contains('NON-ÉMISSION VMS')

    cy.getDataCy('show-risk-factor-explanation-modal').click({ force: true, timeout: 10000 })

    cy.clickButton('Fermer')
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    /**
     * An alert should be shown on the vessel sidebar
     */
    // When
    cy.getDataCy('vessel-search-input').type('tempete couleur')
    cy.getDataCy('vessel-search-item').eq(0).click()
    cy.wait(200)
    cy.getDataCy('vessel-sidebar').should('be.visible')

    // Then
    cy.getDataCy('vessel-sidebar-alert').contains('Pêche en ZEE française par un navire tiers', {
      timeout: 10000
    })
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    /**
     * Vessel with a recent profile
     */
    openVesselBySearch('CFR109')
    cy.getDataCy('impact-risk-factor').click({ force: true, timeout: 10000 })
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')

    /**
     * Fleet segments should be displayed also in the logbook tab
     */
    cy.getDataCy('vessel-menu-fishing').click({ timeout: 10000 })
    cy.getDataCy('vessel-menu-fishing').should('be.visible')
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : PEL03\n' +
        'Zones : 27.4, 27.7, 27.8, 27.9\n' +
        'Engins : OTB, PTB\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : Pélagiques\n" +
        'Espèce cible : aucune"]'
    ).should('exist')
  })

  it('Groups may be displayed, added and removed', () => {
    // When
    openVesselBySearch('tempete couleur')
    cy.wait(500)

    // Add a group
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselTwo')

    cy.clickButton('Ajouter le navire à un groupe fixe')
    cy.contains('li', 'Mission Thémis – semaine 04').click()
    cy.wait('@updateVesselTwo')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .scrollIntoView()
      .should('exist')
    cy.wait(200)

    // Remove the vessel from the group
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .next()
      .click({ force: true })
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselThree')
    cy.clickButton('Confirmer la suppression')
    cy.wait('@updateVesselThree')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]').should('not.exist')
    cy.wait(200)
  })

  it('Vessel profile must be displayed', () => {
    // When
    openVesselBySearch('ABC000022984')

    cy.getDataCy('vessel-profile').contains('Profil du navire').scrollIntoView()

    // Gear
    // The scrollbar in Cypress is 6px width (in dev mode in Firefox the width is 422px)
    cy.get('[title="OTB (100.0%)"]').should('have.css', 'width', '416px').contains('OTB (100.0%)')

    // Species
    cy.get('[title="MNZ (73.4%)"]').should('have.css', 'width', '303px').contains('MNZ (73.4%)')
    cy.get('[title="LEZ (9.7%)"]').should('have.css', 'width', '31px').contains('LEZ')
    cy.get('[title="JOD (5.8%)"]').should('have.css', 'width', '15px').contains('JOD')
    cy.get('[title="WIT (3.0%)"]').should('have.css', 'width', '3px').and('have.prop', 'innerText', '')
    cy.get('[title="Autres (8.1%)"]').should('have.css', 'width', '25px').contains('Autres')

    // Fao zones
    cy.get('[title="27.7.b (98.2%)"]').should('have.css', 'width', '408px').contains('27.7.b (98.2%)')
    cy.get('[title="27.7.c.2 (1.8%)"]').should('have.css', 'width', '0px').and('have.prop', 'innerText', '')

    // Landing ports
    cy.get('[title="Brest (100.0%)"]').should('have.css', 'width', '416px').contains('Brest (100.0%)')
  })
})
