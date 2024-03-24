import { assertNotNullish } from '@utils/assertNotNullish'
import { SideWindowMenuLabel } from 'domain/entities/sideWindow/constants'

import { openSideWindowPriorNotificationList } from './utils'
import { assertAll } from '../../utils/assertAll'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

context('Side Window > Prior Notification List > Filter Bar', () => {
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should filter prior notifications by countries', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*flagStates=FRA&flagStates=ESP*`).as('getPriorNotifications')

    cy.fill('Nationalités', ['Espagne', 'France'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by fleet segments', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*tripSegmentSegments=NWW03&tripSegmentSegments=SWW06*`).as(
      'getPriorNotifications'
    )

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by species', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*specyCodes=FRF&specyCodes=HKE*`).as('getPriorNotifications')

    cy.fill('Espèces à bord', ['FRF', 'HKE'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by gears', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*tripGearCodes=OTT&tripGearCodes=TBS*`).as('getPriorNotifications')

    cy.fill('Engins utilisés', ['OTT', 'TBS'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by last control date', () => {
    openSideWindowPriorNotificationList()

    const expectedPartialBeforeDate = customDayjs.utc().subtract(3, 'months').toISOString().substring(0, 10)
    cy.intercept('GET', `${apiPathBase}*lastControlledBefore=${expectedPartialBeforeDate}*`).as('getPriorNotifications')

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a plus de 3 mois')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

    const expectedPartialAfterDate = customDayjs.utc().subtract(1, 'month').toISOString().substring(0, 10)
    cy.intercept('GET', `${apiPathBase}*lastControlledAfter=${expectedPartialAfterDate}*`).as('getPriorNotifications')

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a moins d’1 mois')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by arrival date (default)', () => {
    const expectedAfterDate = customDayjs.utc()
    const expectedBeforeDate = customDayjs.utc().add(4, 'hours').toISOString()

    cy.viewport(1920, 1080)
    cy.visit('/side_window')
    cy.wait(500)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')
    cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body

      assertNotNullish(priorNotifications)
      assert.isNotEmpty(priorNotifications)

      assertAll(
        priorNotifications,
        priorNotification =>
          customDayjs(priorNotification.expectedArrivalDate).isSameOrAfter(expectedAfterDate) &&
          customDayjs(priorNotification.expectedArrivalDate).isSameOrBefore(expectedBeforeDate)
      )
    })
  })

  it('Should filter prior notifications by arrival date', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    const expectedAfterDate = customDayjs.utc()
    const expectedBeforeDate = customDayjs.utc().add(2, 'hours').toISOString()

    cy.fill('Date d’arrivée estimée', 'Arrivée estimée dans moins de 2h')

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body

      assertNotNullish(priorNotifications)
      assert.isNotEmpty(priorNotifications)

      assertAll(
        priorNotifications,
        priorNotification =>
          customDayjs(priorNotification.expectedArrivalDate).isSameOrAfter(expectedAfterDate) &&
          customDayjs(priorNotification.expectedArrivalDate).isSameOrBefore(expectedBeforeDate)
      )
    })
  })

  it('Should filter prior notifications by arrival date (custom)', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    cy.fill('Date d’arrivée estimée', 'Période spécifique')
    cy.wait('@getPriorNotifications')

    const startDate = getUtcDateInMultipleFormats('2023-01-01T00:00:00Z')
    const endDate = getUtcDateInMultipleFormats('2023-12-31T23:59:59Z')

    cy.fill('Arrivée estimée du navire entre deux dates', [
      startDate.utcDateTupleWithTime,
      endDate.utcDateTupleWithTime
    ])

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body

      assertNotNullish(priorNotifications)
      assert.isNotEmpty(priorNotifications)

      assertAll(
        priorNotifications,
        priorNotification =>
          customDayjs(priorNotification.expectedArrivalDate).isSameOrAfter(startDate.utcDateAsDayjs) &&
          customDayjs(priorNotification.expectedArrivalDate).isSameOrBefore(endDate.utcDateAsDayjs)
      )
    })
  })

  it('Should filter prior notifications by ports', () => {
    openSideWindowPriorNotificationList()

    cy.intercept('GET', `${apiPathBase}*&tripSegmentSegments=NWW03*`).as('getPriorNotifications')

    cy.fill('Ports d’arrivée', ['Saint-Malo', 'Vanne'])

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by type', () => {
    openSideWindowPriorNotificationList()

    cy.intercept(
      'GET',
      `${apiPathBase}*priorNotificationTypes=Préavis type A&priorNotificationTypes=Préavis type C*`
    ).as('getPriorNotifications')

    cy.fill('Types de préavis', ['Préavis type A', 'Préavis type C'])

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })
})
