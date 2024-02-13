import dayjs from 'dayjs'

import { getDate } from '../../../../src/utils'
import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'

context('Side Window > Beacon Malfunction Board', () => {
  beforeEach(() => {
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-menu-beacon-malfunctions"]').click()
  })

  // The 4 specs below have been merged into one in order to prevent flakiness.
  it('A beacon malfunction card Should be moved in the Board, initialized with the beacon malfunctions, be changed in the Board and opened', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 6)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 0)
    cy.intercept('PUT', 'bff/v1/beacon_malfunctions/1').as('moveBeaconMalfunctionCardInColumn')

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .dragTo('*[data-cy="side-window-beacon-malfunctions-columns-AT_QUAY"]', { isSmooth: true })

    // Then
    cy.wait('@moveBeaconMalfunctionCardInColumn').then(({ request, response }) => {
      expect(request.body.stage).contains('AT_QUAY')
      expect(response && response.statusCode).equal(200)
    })
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 5)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-AT_QUAY"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
    // })

    // it('Board Should be initialized with the beacon malfunctions', () => {
    // Then
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]').children().should('have.length', 7)

    // Count the number of cards in the columns' header
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-malfunctions-header"]')
      .contains('5')
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(1)
      .find('*[data-cy="side-window-beacon-malfunctions-header"]')
      .contains('1')
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-malfunctions-header"]')
      .contains('1')

    // Count the number of cards in the columns' body
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 5)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(1)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)

    // Inspect the card body
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .contains('PHENOMENE')

    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-vessel-id"]')
      .first()
      .contains("#1 - modifiée à l'instant")

    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(2)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Activité détectée')
    // })

    // it('A beacon malfunction card vessel status Should be changed in the Board', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Navire à quai')
    cy.intercept('PUT', 'bff/v1/beacon_malfunctions/10').as('moveBeaconMalfunctionCardVesselStatus')

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('.rs-picker-select-menu-item')
      .eq(2)
      .click()

    // Then
    cy.wait('@moveBeaconMalfunctionCardVesselStatus').then(({ request, response }) => {
      expect(request.body.vesselStatus).contains('NO_NEWS')
      expect(response && response.statusCode).equal(200)
    })
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Sans nouvelles')
    // })

    // it('Beacon malfunction Should be opened', () => {
    // Given
    cy.intercept('GET', 'bff/v1/beacon_malfunctions/1').as('showBeaconMalfunction')

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-AT_QUAY"]')
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()

    // Then, check the beacon malfunction data
    cy.wait('@showBeaconMalfunction').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]').should('be.visible')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-vessel-name"]').contains('PHENOMENE')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-cfr"]').contains('FAK000999999')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]')
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Activité détectée')

    // Check the comments order
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comments-number"]').contains('2 commentaires')
    const oneWeekBefore = getUtcizedDayjs().subtract(7, 'days').toISOString()
    const oneWeekBeforeAsString = getDate(oneWeekBefore)
    if (!oneWeekBeforeAsString) {
      throw new Error('`oneWeekBeforeAsString` is undefined.')
    }
    const oneWeekBeforePlusSixtyHours = dayjs(oneWeekBefore).add(60, 'hours').toISOString()
    const oneWeekBeforePlusSixtyHoursAsString = getDate(oneWeekBeforePlusSixtyHours)
    if (!oneWeekBeforePlusSixtyHoursAsString) {
      throw new Error('`oneWeekBeforePlusSixtyHoursAsString` is undefined.')
    }
    const fourDaysBefore = getUtcizedDayjs().subtract(4, 'days').toISOString()
    const fourDaysBeforeAsString = getDate(fourDaysBefore)
    if (!fourDaysBeforeAsString) {
      throw new Error('`fourDaysBeforeAsString` is undefined.')
    }
    cy.wait(200)
    const areFourDaysBeforeAndMalfunctionDateWithOffsetEquals =
      oneWeekBeforePlusSixtyHoursAsString === fourDaysBeforeAsString
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').should(
      'have.length',
      areFourDaysBeforeAndMalfunctionDateWithOffsetEquals ? 4 : 5
    )

    if (areFourDaysBeforeAndMalfunctionDateWithOffsetEquals) {
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(0).contains(oneWeekBeforeAsString)
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(1).contains(fourDaysBeforeAsString)
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(2).contains('Hier')
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(3).contains("Aujourd'hui")
    } else {
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(0).contains(oneWeekBeforeAsString)
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]')
        .eq(1)
        .contains(oneWeekBeforePlusSixtyHoursAsString)
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(2).contains(fourDaysBeforeAsString)
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(3).contains('Hier')
      cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(4).contains("Aujourd'hui")
    }

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-action-content"]').should('have.length', 3)
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-content"]').should('have.length', 2)

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-action-content"]')
      .eq(0)
      .contains('Avarie à quai ouverte dans MonitorFish')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-content"]')
      .eq(0)
      .contains("Ceci est le premier commentaire de la journée ! L'oiseau est dans le nid.")
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-action-content"]')
      .eq(1)
      .contains('Le statut du ticket a été modifié, de Navire à quai à Activité détectée.')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-content"]')
      .eq(1)
      .contains(
        'La pêche profonde résulte directement de l’épuisement des ressources marines dans les eaux de surface. ' +
          'Après avoir surexploité les stocks de poissons en surface, les flottes de pêche industrielles se sont tournées vers les ' +
          'grands fonds pour trouver la ressource qui leur faisait défaut.'
      )
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-action-content"]')
      .eq(2)
      .contains('Le ticket a été déplacé de Premier contact à Navires supposés à quai.')

    // Show vessel on map
    const oneWeeksBeforeDate = getUtcizedDayjs().subtract(8, 'days')
    const oneWeeksBeforePlusOneDayDate = oneWeeksBeforeDate.add(1, 'day')
    cy.log(`afterDateTime=${oneWeeksBeforeDate.toISOString()}`)
    cy.log(`beforeDateTime=${oneWeeksBeforePlusOneDayDate.toISOString()}`)
    cy.intercept(
      'GET',
      new RegExp(
        `bff\\/v1\\/vessels\\/find\\?vesselId=1&internalReferenceNumber=FAK000999999` +
          `&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER` +
          `&trackDepth=CUSTOM` +
          `&afterDateTime=${oneWeeksBeforeDate.format('YYYY-MM-DD')}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z` +
          `&beforeDateTime=${oneWeeksBeforePlusOneDayDate.format('YYYY-MM-DD')}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z`
      )
    ).as('showVesselPositionsOnMap')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-show-vessel"]').click()
    cy.wait('@showVesselPositionsOnMap').then(({ response }) => expect(response && response.statusCode).equal(200))
  })

  it('Beacon malfunction Should be opened and vessel status changed', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]')
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Sans nouvelles')
    cy.intercept('PUT', 'bff/v1/beacon_malfunctions/10').as('moveBeaconMalfunctionCardVesselStatus')

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]')
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]').find('.rs-picker-select-menu-item').eq(1).click()

    // Then
    cy.wait('@moveBeaconMalfunctionCardVesselStatus').then(({ request, response }) => {
      expect(request.body.vesselStatus).contains('AT_SEA')
      expect(response && response.statusCode).equal(200)
    })
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail"]')
      .find('*[data-cy="side-window-beacon-malfunctions-vessel-status"]')
      .contains('Navire en mer')
  })

  it('Beacon malfunction Should be opened and a comment added', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns"]')
      .children()
      .eq(0)
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comments-number"]').contains('0 commentaire')

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-textarea"]').type('I just added a new comment')
    cy.intercept('POST', 'bff/v1/beacon_malfunctions/10/comments').as('addBeaconMalfunctionComment')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-add"]').click({ force: true })

    // Then
    cy.wait('@addBeaconMalfunctionComment').then(({ request, response }) => {
      expect(request.body.comment).contains('I just added a new comment')
      expect(request.body.userType).contains('SIP')
      expect(response && response.statusCode).equal(201)
    })
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comments-number"]').contains('1 commentaire')
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-date"]').eq(1).contains("Aujourd'hui")
    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-comment-content"]')
      .eq(0)
      .contains('I just added a new comment')
  })

  it('Beacon malfunction end of malfunction reason Should be showed', () => {
    // In the board
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .first()
      .find('*[data-cy="side-window-beacon-malfunctions-end-of-malfunction"]')
      .contains('Reprise des émissions')
  })

  it('Notification messages feedback should be showed in beacon follow up', () => {
    // In the board
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .eq(0)
      .scrollIntoView()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(0)
      .contains("Une Notification initiale d'avarie en mer a été envoyée")

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(1)
      .contains('Une Notification à un FMC étranger a été envoyée')

    cy.get('*[data-cy="side-window-beacon-malfunctions-notification-show-details"]').eq(1).click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(1)
      .and('contain', 'foreign@fmc.com')

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(2)
      .contains('Une Relance pour avarie en mer a été envoyée')
      .contains('email non reçu à lepeletier@gmail.com')

    cy.get('*[data-cy="side-window-beacon-malfunctions-notification-show-details"]').eq(2).click()

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(2)
      .and('contain', '0600000000 (SMS)')
      .and('contain', 'lepeletier@gmail.com')
      .and('contain', '0123456789 (fax)')

    cy.get('*[data-cy="side-window-beacon-malfunctions-detail-notification-content"]')
      .eq(3)
      .scrollIntoView()
      .contains("Une Notification de fin d'avarie a été envoyée")
      .contains('email non reçu à lepeletier@gmail.com')
  })

  it('Temporary sent message Should be seen When clicking on sent notification select menu', () => {
    // In the board
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .eq(0)
      .scrollIntoView()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()

    // When
    // Click on send notification select menu
    cy.get('[aria-placeholder="Envoyer un message"]').click()
    cy.get('[data-key="MALFUNCTION_AT_SEA_REMINDER"] > .rs-picker-select-menu-item').click()

    // Then
    cy.get('*[data-cy="side-window-beacon-malfunctions-sending-notification"]').contains(
      "En attente d’envoi d'une Relance pour avarie en mer"
    )
  })

  it('Temporary sent message Should be seen When clicking on sent notification to foreign FMC select menu', () => {
    // In the board
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .eq(0)
      .scrollIntoView()
      .find('*[data-cy="side-window-beacon-malfunctions-card-vessel-name"]')
      .click()

    // When
    // Click on send notification select menu
    cy.get('[aria-placeholder="Envoyer un message"]').click()
    cy.get('[data-key="MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC"] > .rs-picker-select-menu-item').click()
    cy.fill('Choisir la nationalité du FMC', 'ABC')

    // Then
    cy.get('*[data-cy="side-window-beacon-malfunctions-sending-notification"]').contains(
      'En attente d’envoi de la Notification à un FMC étranger'
    )
  })

  it('Archive all Should archive all cards the END OF MALFUNCTION column', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-ARCHIVED"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 0)

    // When
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]').scrollIntoView()
    cy.get('[data-cy="side-window-beacon-malfunctions-archive-all"]').click()

    // Then
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-END_OF_MALFUNCTION"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 0)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-ARCHIVED"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
  })

  it('Beacon malfunctions Should be filtered by status', () => {
    // Given
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 5)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-FOUR_HOUR_REPORT"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)

    // When
    cy.get('[aria-placeholder="Statut"]').click()
    cy.get('[data-key="AT_SEA"]').click()

    // Then
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-FOUR_HOUR_REPORT"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 0)

    // Clean filter
    cy.get('[aria-label="Clear"]').click()
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-INITIAL_ENCOUNTER"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 5)
    cy.get('*[data-cy="side-window-beacon-malfunctions-columns-FOUR_HOUR_REPORT"]')
      .children()
      .find('*[data-cy="side-window-beacon-malfunctions-card"]')
      .should('have.length', 1)
  })
})
