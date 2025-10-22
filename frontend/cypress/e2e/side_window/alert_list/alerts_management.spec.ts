import { openSideWindowAlertList } from './utils'

context('Side Window > Alert Management', () => {
  beforeEach(() => {
    openSideWindowAlertList()

    /**
     * /!\ We need to use `function` and not arrow functions
     * https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Avoiding-the-use-of-this
     */

    cy.get('*[data-cy="side-window-sub-menu-ALERT_MANAGEMENT"]').click()
  })

  it('Should create a new alert with form validation', () => {
    /**
     * Confirmation modal
     */
    cy.clickButton('Créer une nouvelle alerte')
    cy.clickButton('Fermer')
    // Should go back to list directly without confirmation modal
    cy.contains('Gestion des alertes').should('be.visible')

    /**
     * Open new alert form again
     */
    cy.clickButton('Créer une nouvelle alerte')
    cy.getDataCy('go-back-alerts-management-list').click()
    // Should go back to list directly without confirmation modal
    cy.contains('Gestion des alertes').should('be.visible')

    /**
     * Open new alert form again and make changes
     */
    cy.clickButton('Créer une nouvelle alerte')
    cy.fill('Nom', 'Test Alert Name')
    cy.clickButton('Fermer')
    cy.contains('Retour à la liste des alertes').should('be.visible')
    cy.clickButton('Retourner à l’édition')
    cy.getDataCy('go-back-alerts-management-list').click()
    cy.contains('Retour à la liste des alertes').should('be.visible')
    cy.clickButton('Quitter sans enregistrer')

    // Should go back to list
    cy.contains('Gestion des alertes').should('be.visible')

    cy.intercept('POST', '/bff/v1/position_alerts_specs').as('createAlert')

    /**
     * Open new alert form
     */
    cy.clickButton('Créer une nouvelle alerte')

    cy.get('h1').should('contain.text', 'Nouvelle alerte')
    cy.contains('Alerte non enregistrée.')

    /**
     * Fill required fields
     */
    cy.fill('Nom', 'Test Alert Cypress')
    cy.fill('Description', "Description de test pour l'alerte Cypress")
    cy.fill('NATINF associé', '2608')
    cy.fill('Période de validité', 'Sur une période donnée')
    cy.fill('Plage de temps sur mesure', [
      [2024, 1, 15],
      [2024, 1, 30]
    ])
    cy.fill('Récurrence annuelle', true)
    cy.fill("Positions VMS prises en compte par l'alerte", 'Toutes les positions en mer')

    /**
     * Add administrative zones criteria
     */
    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Zones')

    /**
     * Delete the criteria and re-add it
     */
    cy.get('.Component-Dropdow > ul').should('not.contain', 'Zones')
    cy.clickButton('Supprimer le critère')

    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Zones')
    cy.wait(500)

    cy.fill("Zones administratives déclenchant l'alerte", ['27.6.a'])
    cy.fill("Zones réglementaires déclenchant l'alerte", ['Secteur 3'])
    cy.clickButton('ZONES (VMS)')

    /**
     * Add nationality zones criteria
     */
    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Nationalités')
    cy.fill("Nationalités déclenchant l'alerte", ['Royaume-Uni'])
    cy.clickButton('NATIONALITÉS')

    /**
     * Add vessels zones criteria
     */
    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Navires')
    cy.getDataCy('VesselSearch-input').type('pheno')
    cy.getDataCy('VesselSearch-item').first().click()
    cy.contains('PHENOMENE').should('be.visible')
    cy.contains('FAK000999999').should('be.visible')
    cy.get('[title="Supprimer le navire"]').last().click()
    cy.contains('PHENOMENE').should('not.exist')
    // Re-add vessel
    cy.getDataCy('VesselSearch-input').type('pheno')
    cy.getDataCy('VesselSearch-item').first().click()
    cy.clickButton('NAVIRES')

    /**
     * Add producers organization criteria
     */
    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Organisations de producteurs')
    cy.fill("Organisations de producteurs déclenchant l'alerte", ['COBRENORD'])
    cy.clickButton('ORGANISATIONS DE PRODUCTEURS')

    /**
     * Add district criteria
     */
    cy.clickButton('Ajouter un critère de déclenchement')
    cy.clickButton('Départements et quartiers')
    cy.fill("Départements et/ou quartiers déclenchant l'alerte", ["Les Sables D'Olonne"])
    cy.contains('DÉPARTEMENTS ET QUARTIERS').click()

    cy.clickButton('Enregistrer')

    cy.wait('@createAlert').then(interception => {
      expect(interception.request.body.name).to.equal('Test Alert Cypress')
      expect(interception.request.body.description).to.equal("Description de test pour l'alerte Cypress")
      expect(interception.request.body.natinfCode).to.equal(2608)
      expect(interception.request.body.validityStartDatetimeUtc).to.equal('2024-01-15T00:00:00.000Z')
      expect(interception.request.body.validityEndDatetimeUtc).to.equal('2024-01-30T23:59:59.000Z')
      expect(interception.request.body.repeatEachYear).to.be.true
      expect(interception.request.body.onlyFishingPositions).to.be.false
      expect(interception.request.body.flagStatesIso2).to.deep.equal(['GB'])
      expect(interception.request.body.districtCodes).to.deep.equal(['LS'])
      expect(interception.request.body.vesselIds).to.deep.equal([1])
      expect(interception.request.body.producerOrganizations).to.deep.equal(['COBRENORD'])
      expect(interception.request.body.administrativeAreas).to.deep.equal([
        {
          areas: ['27.6.a'],
          areaType: 'FAO_AREA'
        }
      ])
      expect(interception.request.body.regulatoryAreas).to.deep.equal([
        {
          lawType: 'Reg. NAMO',
          topic: 'Armor CSJ Dragues',
          zone: 'Secteur 3'
        }
      ])
    })

    cy.contains('Gestion des alertes').should('be.visible')
    cy.fill('Rechercher une alerte', 'Test Alert Cypress')
    cy.get('[title="Éditer l\'alerte"]').click()
    cy.clickButton('Supprimer l’alerte')
    cy.clickButton('Confirmer la suppression')
  })

  it('Should edit an existing alert', () => {
    cy.get('.Component-Banner').contains(
      `L'alerte "Alerte en erreur" a été désactivée, car elle générait trop d'occurrences simultanées. Veuillez modifier ses critères ou la supprimer.`
    )
    cy.intercept('PUT', '/bff/v1/position_alerts_specs/*').as('updateAlert')

    /**
     * Edit alert with error
     */
    cy.fill('Rechercher une alerte', 'Alerte en erreur')
    cy.get('[title="Éditer l\'alerte"]').click()

    cy.get('h1').should('contain.text', 'Modifier une alerte')

    cy.fill('Nom', 'Nom modifié')
    cy.fill('Description', 'Description modifiée')
    cy.fill('Période de validité', 'En tous temps')
    cy.get('.rs-picker-input').should('not.exist')
    cy.fill("Positions VMS prises en compte par l'alerte", 'Les positions en pêche uniquement')

    cy.clickButton('Enregistrer')

    cy.wait('@updateAlert').then(interception => {
      expect(interception.request.body.name).to.equal('Nom modifié')
      expect(interception.request.body.description).to.equal('Description modifiée')
      expect(interception.request.body.onlyFishingPositions).to.be.true
      expect(interception.request.body.validityStartDatetimeUtc).to.be.undefined
      expect(interception.request.body.validityEndDatetimeUtc).to.be.undefined
    })

    cy.contains('Gestion des alertes').should('be.visible')
    cy.fill('Rechercher une alerte', 'modifié')
    cy.getDataCy('alerts-specification-list-length').contains('1 alerte')
    cy.get('.Component-Banner').contains("L'alerte a bien été modifiée")
    cy.get('.Component-Banner').should('not.contain', 'a été désactivée')
  })

  it('Alerts specifications Should be shown in the table', () => {
    cy.get('.Table-SimpleTable tr').should('have.length', 22)
    cy.getDataCy('alerts-specification-list-length').contains('21 alertes')

    /**
     * Activate/deactivate an alert
     */
    cy.get('[name="activate-alert-POSITION_ALERT-17"]').click({ force: true })
    cy.clickButton('Confirmer la désactivation')
    cy.wait(500)
    cy.get('[name="activate-alert-POSITION_ALERT-17"]').click({ force: true })
    cy.wait(500)

    /**
     * Delete an alert
     */
    cy.get('[title*="Supprimer"][title*="Alerte 1"]').click()
    cy.clickButton('Confirmer la suppression')

    cy.get('.Table-SimpleTable tr').should('have.length', 21)
    cy.getDataCy('alerts-specification-list-length').contains('20 alertes')

    /**
     * Search an alert
     */
    cy.fill('Rechercher une alerte', '12 milles')
    cy.getDataCy('alerts-specification-list-length').contains('5 alertes')
    cy.get('.Table-SimpleTable tr').should('have.length', 6)

    cy.get('[title="Pêche dans les 12 milles sans droits historiques (ES)"]').scrollIntoView().click({ force: true })
    cy.get('[data-id="POSITION_ALERT:6"]').contains('Nationalités, Zones (VMS)')
    cy.get('[data-id="POSITION_ALERT:6"]').contains('En tous temps')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains(
      'Pour les navires espagnols en pêche dans les 12 milles hors de leurs zones de droits historiques.'
    )
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Les positions en pêche uniquement')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Espagne')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('Distances à la côte: 12 milles (sans la ZEE ESP)')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('8 heures')
    cy.get('[data-id="POSITION_ALERT:6-expanded"]').contains('10 minutes')

    cy.fill('Rechercher une alerte', undefined)
    cy.get('[title="Alerte all-in"]').scrollIntoView().click({ force: true })
    cy.get('[data-id="POSITION_ALERT:13"]').contains(
      'Navires, Espèces à bord, Zones de capture (FAR), Nationalités, Quartiers, OPs, Zones (VMS), Engins'
    )
    cy.get('[data-id="POSITION_ALERT:13"]').contains('22206')
    cy.get('[data-id="POSITION_ALERT:13-expanded"]').contains(
      "HKE - MERLU D'EUROPE (min. 713kg), LOB - CROUPIA ROCHE, SOL - SOLE COMMUNE"
    )
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
    cy.get('.Component-Dialog').contains('Aujourd’hui, MonitorFish compte au total 18 alertes :')
    cy.clickButton('Fermer')
  })
})
