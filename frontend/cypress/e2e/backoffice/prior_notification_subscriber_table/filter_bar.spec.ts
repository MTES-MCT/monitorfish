import { openBackOfficePriorNotificationSubscriberList } from './utils'

context('BackOffice > Prior Notification Table > Filter Bar', () => {
  beforeEach(() => {
    openBackOfficePriorNotificationSubscriberList()

    cy.get('[name="administrationId').should('not.be.disabled')
    cy.get('[name="portLocode').should('not.be.disabled')

    cy.wait(1000)
  })

  it('Should filter subscribers by search query', () => {
    cy.intercept('GET', '/bff/v1/prior_notification_subscribers?*searchQuery=abc*').as(
      'getPriorNotificationSubscribers'
    )

    cy.fill('Rechercher...', 'abc')

    cy.wait('@getPriorNotificationSubscribers')
  })

  it('Should filter subscribers by administration', () => {
    cy.intercept('GET', '/bff/v1/prior_notification_subscribers?*administrationId=1*').as(
      'getPriorNotificationSubscribers'
    )

    cy.fill('Administration', 'Administration 1')

    cy.wait('@getPriorNotificationSubscribers')
  })

  it('Should filter subscribers by port', () => {
    cy.intercept('GET', '/bff/v1/prior_notification_subscribers?*portLocode=FRNCE*').as(
      'getPriorNotificationSubscribers'
    )

    cy.fill('Port de diffusion', 'Nice')

    cy.wait('@getPriorNotificationSubscribers')
  })
})
