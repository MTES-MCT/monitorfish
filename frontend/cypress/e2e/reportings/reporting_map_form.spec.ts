import { hoverOrClickVesselByName } from '../../support/commands/hoverOrClickVesselByName'

context('Reporting map form', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
  })

  it('Should create a new INN reporting then update an existing one', () => {
    // NAMO area — contains the reporting for 'RENCONTRER VEILLER APPARTEMENT'
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)

    // --- Part 1: Create ---
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Créer un nouveau signalement INN')

    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')
    cy.get('*[data-cy="map-reporting-form"]').contains('NOUVEAU SIGNALEMENT INN')
    cy.get('*[data-cy="map-reporting-form"]').contains('Signalement non enregistré')

    cy.fill('Navire absent de la base de données', true)
    cy.fill('Navire non identifiable', true)
    cy.fill('Titre', 'Test INN - pêche illicite')
    cy.fill('Type d\u2019infraction et NATINF', ['27717'])

    cy.wait('@createReporting')
    cy.get('*[data-cy="map-reporting-form"]').contains('Dernière modif.')

    cy.clickButton('Fermer')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

    // --- Part 2: Update ---
    cy.intercept('PUT', '/bff/v1/reportings/*').as('updateReporting')

    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'hover', 12)
    cy.getDataCy('reporting-overlay').should('be.visible')
    cy.getDataCy('reporting-overlay').contains('RENCONTRER VEILLER APPARTEMENT')
    cy.getDataCy('reporting-overlay').contains('INN')
    cy.getDataCy('reporting-overlay').contains('Suspicion d\'infraction')
    cy.getDataCy('reporting-overlay').contains('Pêche sans VMS')

    cy.clickButton('Modifier le signalement')
    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')
    cy.get('*[data-cy="map-reporting-form"]').contains('RENCONTRER VEILLER APPARTEMENT')

    cy.fill('Titre', 'Mise à jour du titre depuis le test cypress')
    cy.wait('@updateReporting')
    cy.get('*[data-cy="map-reporting-form"]').contains('Dernière modif.')

    cy.clickButton('Fermer')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'hover', 12)
    cy.getDataCy('reporting-overlay').contains('Mise à jour du titre depuis le test cypress')
  })

  it('Should delete a reporting after confirming the modal', () => {
    // NAMO area — contains the reporting for 'RENCONTRER VEILLER APPARTEMENT'
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)

    cy.intercept('DELETE', '/bff/v1/reportings/*').as('deleteReporting')

    hoverOrClickVesselByName('RENCONTRER VEILLER APPARTEMENT', 'REPORTING', 'hover', 12)
    cy.getDataCy('reporting-overlay').should('be.visible')

    cy.clickButton('Modifier le signalement')
    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')

    cy.clickButton('Supprimer ce signalement')

    // Confirm modal
    cy.get('.Component-Dialog').contains('Suppression d\'un signalement').should('be.visible')
    cy.get('.Component-Dialog').contains('Êtes-vous sûr de vouloir supprimer ce signalement ?').should('be.visible')
    cy.clickButton('Supprimer')

    cy.wait('@deleteReporting')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')
  })

  it('Should show the archived status in the form for an archived reporting', () => {
    // Navigate to French Guiana area — contains 'AMAZONIA QUEEN' (archived, INFRACTION_SUSPICION)
    cy.visit('/#@-5808000,716000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)

    // Apply the 'Archivé' filter in the map menu
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.fill('Statut', 'Archivé')
    cy.wait('@displayReportings')

    // Click on an archived reporting vessel visible at these coordinates
    hoverOrClickVesselByName('AMAZONIA QUEEN', 'REPORTING', 'hover', 12)
    cy.getDataCy('reporting-overlay').should('be.visible')
    cy.getDataCy('reporting-overlay').contains('AMAZONIA QUEEN')
    cy.getDataCy('reporting-overlay').contains('Archivé')

    // Open the edit form
    cy.clickButton('Modifier le signalement')
    cy.get('*[data-cy="map-reporting-form"]').should('be.visible')

    // Archived-specific UI
    cy.get('*[data-cy="map-reporting-form"]').contains('Le signalement a été archivé.')

    cy.intercept('PUT', '/bff/v1/reportings/*').as('updateReporting')
    cy.fill('Titre', 'Mise à jour du titre depuis le test cypress')
    cy.clickButton('Enregistrer et fermer')
    cy.wait('@updateReporting')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

    hoverOrClickVesselByName('AMAZONIA QUEEN', 'REPORTING', 'hover', 12)
    cy.getDataCy('reporting-overlay').should('be.visible')
    cy.getDataCy('reporting-overlay').contains('Mise à jour du titre depuis le test cypress')
  })
})
