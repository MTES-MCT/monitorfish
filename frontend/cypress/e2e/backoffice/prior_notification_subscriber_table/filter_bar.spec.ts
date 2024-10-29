import { openBackOfficePriorNotificationSubscriberList } from './utils'

context('BackOffice > Prior Notification Table > Filter Bar', () => {
  beforeEach(() => {
    openBackOfficePriorNotificationSubscriberList()

    cy.get('[name="administrationId').should('not.be.disabled')
    cy.get('[name="portLocode').should('not.be.disabled')

    cy.wait(1000)
  })

  it('Should filter subscribers by search query', () => {
    cy.contains('A636 Maïto (Marine Nationale)').should('be.visible')

    cy.fill('Rechercher...', 'natu')

    cy.contains('A636 Maïto (Marine Nationale)').should('not.exist')
    cy.contains('Natura 2000 Côte Bleue Marine (Gestionnaire AMP)').should('be.visible')
    cy.contains('PNM Martinique (Parcs Naturels Marins)').should('be.visible')
  })

  it('Should filter subscribers by administration', () => {
    cy.contains('A636 Maïto (Marine Nationale)').should('be.visible')

    cy.fill('Administration', 'Gendarmerie Nationale')

    cy.contains('A636 Maïto (Marine Nationale)').should('not.exist')
    cy.contains('BN Toulon (Gendarmerie Nationale)').should('be.visible')
    cy.contains('Brigade fluviale de Rouen (Gendarmerie Nationale)').should('be.visible')
  })

  it('Should filter subscribers by port', () => {
    cy.intercept('GET', '/bff/v1/prior_notification_subscribers?*portLocode=FRNCE*').as(
      'getPriorNotificationSubscribers'
    )

    cy.fill('Port de diffusion', 'Nice')

    cy.wait('@getPriorNotificationSubscribers')
  })
})
