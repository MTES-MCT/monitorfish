import { openBackOfficePriorNotificationSubscriberList } from './utils'

context('BackOffice > Prior Notification Table > Filter Bar', () => {
  beforeEach(() => {
    cy.intercept('GET', `/api/v1/administrations`).as('getAdministrations')
    cy.intercept('GET', `/bff/v1/ports`).as('getPorts')

    openBackOfficePriorNotificationSubscriberList()

    cy.wait('@getAdministrations')
    cy.wait('@getPorts')

    cy.wait(1000)
  })

  it('Should filter subscribers by search query', () => {
    cy.contains('BGC Lorient - DF 36 Kan An Avel (Douane)').should('be.visible')

    cy.fill('Rechercher...', 'mari')

    cy.contains('BGC Lorient - DF 36 Kan An Avel (Douane)').should('not.exist')
    cy.contains('Cultures marines 56 (DDTM)').should('be.visible') // "mari" in control unit name
    cy.contains('BSL Lorient (Gendarmerie Maritime)').should('be.visible') // "mari" in administration name
  })

  it('Should filter subscribers by administration', () => {
    cy.contains('BGC Lorient - DF 36 Kan An Avel (Douane)').should('be.visible')

    cy.fill('Administration', 'Gendarmerie Maritime')

    cy.contains('BGC Lorient - DF 36 Kan An Avel (Douane)').should('not.exist')
    cy.contains('BSL Lorient (Gendarmerie Maritime)').should('be.visible')
  })

  it('Should filter subscribers by port', () => {
    cy.intercept('GET', '/bff/v1/prior_notification_subscribers?*portLocode=FRNCE*').as(
      'getPriorNotificationSubscribers'
    )

    cy.fill('Port de diffusion', 'Nice')

    cy.wait('@getPriorNotificationSubscribers')
  })
})
