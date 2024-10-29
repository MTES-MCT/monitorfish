import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { assertNotNullish } from '@utils/assertNotNullish'
import { SideWindowMenuLabel } from 'domain/entities/sideWindow/constants'

import { openSideWindowPriorNotificationListAsSuperUser } from './utils'
import { assertAll } from '../../utils/assertAll'
import { customDayjs } from '../../utils/customDayjs'

context('Side Window > Prior Notification List > VesselFilter Bar', () => {
  const apiPathBase = '/bff/v1/prior_notifications?'

  it('Should filter prior notifications by seafront group', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*seafrontGroup=MEMN*`).as('getPriorNotificationsForMEMN')

    cy.getDataCy('side-window-sub-menu-MEMN').click()

    cy.wait('@getPriorNotificationsForMEMN')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

    cy.intercept('GET', `${apiPathBase}*seafrontGroup=NONE*`).as('getPriorNotificationsForNONE')

    cy.getDataCy('side-window-sub-menu-NONE').click()

    cy.wait('@getPriorNotificationsForNONE')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by vessel name (search input)', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*searchQuery=pheno*`).as('getPriorNotifications')

    cy.fill('Rechercher un navire', 'pheno')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by countries', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*flagStates=ESP,FRA*`).as('getPriorNotifications')

    cy.fill('Nationalités', ['Espagne', 'France'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by fleet segments', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*tripSegmentCodes=NWW03,SWW06*`).as('getPriorNotifications')

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by species', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*specyCodes=FRF,HKE*`).as('getPriorNotifications')

    cy.fill('Espèces à bord', ['FRF', 'HKE'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by gears', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*tripGearCodes=OTT,TBS*`).as('getPriorNotifications')

    cy.fill('Engins utilisés', ['OTT', 'TBS'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by last control date', () => {
    openSideWindowPriorNotificationListAsSuperUser()

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

  it('Should filter prior notifications with or without reportings', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*hasOneOrMoreReportings=true*`).as('getPriorNotificationsWithReportings')

    cy.fill('Sans signalement', false)

    cy.wait('@getPriorNotificationsWithReportings')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

    cy.intercept('GET', `${apiPathBase}*hasOneOrMoreReportings=false*`).as('getPriorNotificationsWithoutReportings')

    cy.fill('Avec signalements', false)
    cy.fill('Sans signalement', true)

    cy.wait('@getPriorNotificationsWithoutReportings')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by arrival date (default)', () => {
    const expectedAfterDate = customDayjs.utc()
    const expectedBeforeDate = customDayjs.utc().add(4, 'hours').toISOString()

    cy.viewport(1920, 1080)
    cy.login('superuser')
    cy.visit('/side_window')
    cy.wait(500)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')
    cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body.data

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
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    const expectedAfterDate = customDayjs.utc()
    const expectedBeforeDate = customDayjs.utc().add(2, 'hours').toISOString()

    cy.fill('Date d’arrivée estimée', 'Arrivée estimée dans moins de 2h')

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body.data

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
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*`).as('getPriorNotifications')

    cy.fill('Date d’arrivée estimée', 'Période spécifique')

    cy.get('input[aria-label="Jour de début"]').type('01')
    cy.get('input[aria-label="Mois de début"]').type('01')
    cy.get('input[aria-label="Année de début"]').type('2023')
    cy.get('input[aria-label="Jour de fin"]').type('31')
    cy.get('input[aria-label="Mois de fin"]').type('12')
    cy.get('input[aria-label="Année de fin"]').type('2023')

    cy.wait('@getPriorNotifications').then(interception => {
      const priorNotifications: PriorNotification.PriorNotification[] = interception.response?.body.data

      assertNotNullish(priorNotifications)
      assert.isNotEmpty(priorNotifications)

      assertAll(
        priorNotifications,
        priorNotification =>
          customDayjs(priorNotification.expectedArrivalDate).isSameOrAfter('2023-01-01T00:00:00.000Z') &&
          customDayjs(priorNotification.expectedArrivalDate).isSameOrBefore('2023-12-31T23:59:59.000Z')
      )
    })
  })

  it('Should filter prior notifications by ports', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*portLocodes=FRSML,FRVNE*`).as('getPriorNotifications')

    cy.fill('Ports d’arrivée', ['Saint-Malo', 'Vanne'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by types', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*priorNotificationTypes=${encodeURI('Préavis type A,Préavis type C')}*`).as(
      'getPriorNotifications'
    )

    cy.fill('Types de préavis', ['Préavis type A', 'Préavis type C'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by statuses', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept(
      'GET',
      `${apiPathBase}*isInvalidated=true*states=${PriorNotification.State.AUTO_SEND_DONE},${PriorNotification.State.PENDING_AUTO_SEND},${PriorNotification.State.PENDING_SEND},${PriorNotification.State.VERIFIED_AND_SENT}*`
    ).as('getPriorNotifications')

    cy.fill('Statuts de diffusion', [
      PriorNotification.STATE_LABEL[PriorNotification.State.AUTO_SEND_DONE],
      'Invalidé',
      PriorNotification.STATE_LABEL[PriorNotification.State.VERIFIED_AND_SENT]
    ])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications for vessels with length < or >= 12 meters', () => {
    openSideWindowPriorNotificationListAsSuperUser()

    cy.intercept('GET', `${apiPathBase}*isLessThanTwelveMetersVessel=true*`).as(
      'getPriorNotificationsForVesselsWithLengthLessThanTwelveMeters'
    )

    cy.fill('Navires ≥ 12 m', false)

    cy.wait('@getPriorNotificationsForVesselsWithLengthLessThanTwelveMeters')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

    cy.intercept('GET', `${apiPathBase}*isLessThanTwelveMetersVessel=false*`).as(
      'getPriorNotificationsForVesselsWithLengthGreaterTwelveMeters'
    )

    cy.fill('Navires < 12 m', false)
    cy.fill('Navires ≥ 12 m', true)

    cy.wait('@getPriorNotificationsForVesselsWithLengthGreaterTwelveMeters')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })
})
