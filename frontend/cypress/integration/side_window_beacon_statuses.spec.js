/// <reference types="cypress" />

import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Beacon statuses', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/side_window`)
    cy.get('*[data-cy="side-window-menu-beacon-statuses"]').click()
  })

  it('A beacon status card Should be moved in the Board', () => {
    // Given
    cy.request('PUT', 'bff/v1/beacon_statuses/1', {stage: 'INITIAL_ENCOUNTER'})
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 2)
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 1)
    cy.intercept('PUT', 'bff/v1/beacon_statuses/1').as('moveBeaconStatusCardInColumn')

    // When
    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .dragTo('*[data-cy="side-window-beacon-statuses-columns-RELAUNCH_REQUEST"]')

    // Then
    cy.wait('@moveBeaconStatusCardInColumn')
      .then(({ request, response }) => {
        expect(request.body.stage).contains('RELAUNCH_REQUEST')
        expect(response.statusCode).equal(200)
      })
    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-statuses-columns-RELAUNCH_REQUEST"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 2)
  })

  it('Board Should be initialized with the beacon statuses', () => {
    // Then
    cy.get('*[data-cy="side-window-sub-menu-Avaries VMS en cours-number"]').contains('4')
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children().should('have.length', 6)

    // Count the number of cards in the columns' header
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-statuses-header"]')
      .contains('1')
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(1)
      .find('*[data-cy="side-window-beacon-statuses-header"]')
      .contains('1')
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-header"]')
      .contains('2')

    // Count the number of cards in the columns' body
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(1)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .should('have.length', 2)

    // Inspect the card body
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .contains('PHENOMENE')

    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .contains('Prioritaire')

    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('En arrêt technique')
  })

  it('A beacon status card vessel status Should be changed in the Board', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('Navire à quai')
    cy.intercept('PUT', 'bff/v1/beacon_statuses/4').as('moveBeaconStatusCardVesselStatus')

    // When
    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('.rs-picker-select-menu-item')
      .eq(4)
      .click()

    // Then
    cy.wait('@moveBeaconStatusCardVesselStatus')
      .then(({ request, response }) => {
        expect(request.body.vesselStatus).contains('ACTIVITY_DETECTED')
        expect(response.statusCode).equal(200)
      })
    cy.get('*[data-cy="side-window-beacon-statuses-columns-INITIAL_ENCOUNTER"]').children()
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('Activité détectée')
  })

  it('Beacon status Should be opened', () => {
    // Given
    cy.intercept('GET', 'bff/v1/beacon_statuses/1').as('showBeaconStatus')

    // When
    cy.get('*[data-cy="side-window-beacon-statuses-columns-RELAUNCH_REQUEST"]')
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-card-vessel-name"]')
      .click()

    // Then, check the beacon status data
    cy.wait('@showBeaconStatus')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
    cy.get('*[data-cy="side-window-beacon-statuses-detail"]').should('be.visible')
    cy.get('*[data-cy="side-window-beacon-statuses-detail"]').find('*[data-cy="risk-factor"]').contains('2.5')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-vessel-name"]').contains('PHENOMENE')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-cfr"]').contains('FAK000999999')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-priority"]').contains('Prioritaire')
    cy.get('*[data-cy="side-window-beacon-statuses-detail"]')
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('En arrêt technique')

    // Check the comments order
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comments-number"]').contains('2 commentaires')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').should('have.length', 4)
    let twoWeeksBefore = new Date()
    twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
    twoWeeksBefore = getDate(twoWeeksBefore.toUTCString())
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').eq(0).contains(twoWeeksBefore)
    let oneWeeksBefore = new Date()
    oneWeeksBefore.setDate(oneWeeksBefore.getDate() - 7)
    oneWeeksBefore = getDate(oneWeeksBefore.toUTCString())
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').eq(1).contains(oneWeeksBefore)
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').eq(2).contains('Hier')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').eq(3).contains('Aujourd\'hui')

    cy.get('*[data-cy="side-window-beacon-statuses-detail-action-content"]').should('have.length', 3)
    cy.get('*[data-cy="side-window-beacon-statuses-detail-action-content"]').eq(0)
      .contains('Le statut du ticket a été modifié, de Navire à quai à En arrêt technique.')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-action-content"]').eq(2)
      .contains('Le ticket a été déplacé de Premier contact à Relance pour reprise.')

    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-content"]').should('have.length', 2)
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-content"]').eq(0)
      .contains('Ceci est le premier commentaire de la journée ! L\'oiseau est dans le nid.')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-content"]').eq(1)
      .contains('La pêche profonde résulte directement de l’épuisement des ressources marines dans les eaux de surface. ' +
        'Après avoir surexploité les stocks de poissons en surface, les flottes de pêche industrielles se sont tournées vers les ' +
        'grands fonds pour trouver la ressource qui leur faisait défaut.')

    // Show vessel on map
    cy.intercept('GET', 'bff/v1/vessels/find?internalReferenceNumber=FAK000999999' +
      '&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*').as('showVesselPositionsOnMap')
    cy.intercept('GET', 'bff/v1/ers/find?internalReferenceNumber=FAK000999999' +
      '&externalReferenceNumber=DONTSINK&IRCS=CALLME&voyageRequest=LAST&tripNumber=').as('showVesselVoyageOnMap')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-show-vessel"]').click()
    cy.wait('@showVesselPositionsOnMap')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
    cy.wait('@showVesselVoyageOnMap')
      .then(({ request, response }) => expect(response.statusCode).equal(200))
  })

  it('Beacon status Should be opened and vessel status changed', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-card-vessel-name"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-statuses-detail"]')
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('Activité détectée')
    cy.intercept('PUT', 'bff/v1/beacon_statuses/4').as('moveBeaconStatusCardVesselStatus')

    // When
    cy.get('*[data-cy="side-window-beacon-statuses-detail"]')
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-statuses-detail"]')
      .find('.rs-picker-select-menu-item')
      .eq(3)
      .click()

    // Then
    cy.wait('@moveBeaconStatusCardVesselStatus')
      .then(({ request, response }) => {
        expect(request.body.vesselStatus).contains('TECHNICAL_STOP')
        expect(response.statusCode).equal(200)
      })
    cy.get('*[data-cy="side-window-beacon-statuses-detail"]')
      .find('*[data-cy="side-window-beacon-statuses-vessel-status"]')
      .contains('En arrêt technique')
  })

  it('Beacon status Should be opened and a comment added', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-statuses-columns"]').children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-statuses-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-statuses-card-vessel-name"]')
      .click()
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comments-number"]').contains('0 commentaire')

    // When
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-textarea"]')
      .type('I just added a new comment')
    cy.intercept('POST', 'bff/v1/beacon_statuses/4/comments').as('addBeaconStatusComment')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-add"]').click({ force: true })

    // Then
    cy.wait('@addBeaconStatusComment')
      .then(({ request, response }) => {
        expect(request.body.comment).contains('I just added a new comment')
        expect(request.body.userType).contains('SIP')
        expect(response.statusCode).equal(201)
      })
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comments-number"]').contains('1 commentaire')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-date"]').eq(0).contains('Aujourd\'hui')
    cy.get('*[data-cy="side-window-beacon-statuses-detail-comment-content"]').eq(0)
      .contains('I just added a new comment')
  })
})
