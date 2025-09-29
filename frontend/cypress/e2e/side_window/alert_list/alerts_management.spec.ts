import {openSideWindowAlertList} from './utils'

context('Side Window > Alert Management', () => {
  beforeEach(() => {
    openSideWindowAlertList()

    /**
     * /!\ We need to use `function` and not arrow functions
     * https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Avoiding-the-use-of-this
     */

    cy.get('*[data-cy="side-window-sub-menu-ALERT_MANAGEMENT"]').click()
  })

  it('Alerts specifications Should be shown in the table', () => {
    cy.get('.Table-SimpleTable tr').should('have.length', 22)
    cy.getDataCy('alerts-specification-list-length').contains('21 alertes')

    cy.fill('Rechercher une alerte', '12 milles')
    cy.getDataCy('alerts-specification-list-length').contains('5 alertes')
    cy.get('.Table-SimpleTable tr').should('have.length', 6)

    cy.get('[title="Pêche dans les 12 milles sans droits historiques (ES)"]').scrollIntoView().click({ force: true })
    cy.get('[data-id="POSITION_ALERT:6"]').contains('Nationalités, Zones (VMS)')
    cy.get('[data-id="POSITION_ALERT:6"]').contains('En tous temps')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Pour les navires espagnols en pêche dans les 12 milles hors de leurs zones de droits historiques.')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Les positions en pêche uniquement')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Espagne')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Distances à la côte: 12 milles (sans la ZEE ESP)')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('8 heures')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('10 minutes')

    cy.fill('Rechercher une alerte', undefined)
    cy.get('[title="Alerte all-in"]').scrollIntoView().click({ force: true })
    cy.get('[data-id="POSITION_ALERT:13"]').contains('Navires, Espèces à bord, Zones de capture (FAR), Nationalités, Quartiers, OPs, Zones (VMS), Engins')
    cy.get('[data-id="POSITION_ALERT:13"]').contains('22206')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('HKE - MERLU D\'EUROPE (min. 713kg), LOB - CROUPIA ROCHE, SOL - SOLE COMMUNE')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('27.7.e, 27.7.d, 27.8.a')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('France, Espagne, Allemagne, Danemark')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('CC, BR, MO, NO')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('SA THO AN, OP DU SUD')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('Zones FAO: 27, 28.8')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('Zones ZEE: FRA, BEL')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('Zone REG "Morbihan - bivalves - Secteur 1"')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('Zone REG "Morbihan - bivalves - Secteur 2"')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains('Zone REG "Mediterranée - filets - Zone A"')

    cy.clickButton('En savoir plus sur le fonctionnement des alertes')
    cy.get('.Component-Dialog').contains('Aujourd’hui, MonitorFish compte au total 19 alertes :')
    cy.clickButton('Fermer')
  })
})
