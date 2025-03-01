import { Seafront } from '@constants/seafront'
import { faker } from '@faker-js/faker'
import { Logbook } from '@features/Logbook/Logbook.types'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import dayjs from 'dayjs'

import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

import type { OrUndefinedToOrNull } from '../../types'
import type { BackendApi } from '@api/BackendApi.types'
import type { Reporting } from '@features/Reporting/types'

/**
 * For both logbook and manual prior notifications.
 *
 * @returns Created reporting ID.
 */
export const createReportingFromPriorNotificationForm = (vesselName: string, reportId: string) => {
  cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
  cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

  editSideWindowPriorNotification(vesselName, reportId)

  cy.clickButton('Ouvrir un signalement sur le navire')
  cy.wait('@getVesselReportings')

  cy.fill('Titre', faker.word.words(3))
  cy.fill('Natinf', '23588')
  cy.fill('Saisi par', 'BOB')

  cy.clickButton('Valider')

  return cy.wait('@createReporting').then(createInterception => {
    if (!createInterception.response) {
      assert.fail('`createInterception.response` is undefined.')
    }

    const createdPriorNotification: Reporting.Reporting = createInterception.response.body

    return createdPriorNotification.id
  })
}

// For both logbook and manual prior notifications
export const editSideWindowPriorNotification = (vesselName: string, reportId: string) => {
  openSideWindowPriorNotificationListAsSuperUser()

  cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
  cy.fill('Rechercher un navire', vesselName)
  cy.wait(500)

  cy.getTableRowById(reportId).clickButton('Éditer le préavis')
  if (document.querySelector('[data-cy="first-loader"]')) {
    cy.getDataCy('first-loader').should('not.be.visible')
  }

  cy.wait(500)
}

export function getPriorNotificationsFakeResponse({
  isManuallyCreated,
  state,
  updatedAt
}: {
  isManuallyCreated: boolean
  state: PriorNotification.State
  updatedAt: string
}): BackendApi.ResponseBodyPaginatedList<
  OrUndefinedToOrNull<PriorNotification.PriorNotification>,
  Logbook.ApiListExtraData
> {
  const reportId = isManuallyCreated ? '00000000-0000-4000-0000-000000000000' : 'FAKE_OPERATION_000'
  const createdAt = dayjs().subtract(1, 'hour').toISOString()
  const expectedArrivalDate = dayjs().add(1, 'hour').toISOString()
  const fingerprint = `${reportId}.${updatedAt}.${state}`

  return {
    data: [
      {
        acknowledgment: null,
        expectedArrivalDate,
        expectedLandingDate: expectedArrivalDate,
        fingerprint,
        isCorrection: false,
        isInvalidated: null,
        isManuallyCreated,
        isPriorNotificationZero: false,
        isVesselUnderCharter: false,
        onBoardCatches: [
          {
            conversionFactor: null,
            economicZone: null,
            effortZone: null,
            faoZone: '21.1.C',
            freshness: null,
            nbFish: null,
            packaging: null,
            presentation: null,
            preservationState: null,
            species: 'AGS',
            speciesName: 'SARDINELLE TACHETEE',
            statisticalRectangle: null,
            weight: 50.0
          }
        ],
        operationDate: createdAt,
        portLocode: 'FRMRS',
        portName: 'Marseille',
        purposeCode: PriorNotification.PurposeCode.LAN,
        reportId,
        reportingCount: 0,
        riskFactor: 3.2,
        seafront: Seafront.MEMN,
        sentAt: createdAt,
        state,
        tripGears: [{ dimensions: null, gear: 'OTT', gearName: null, mesh: null }],
        tripSegments: [{ code: 'MED01', name: 'All Trawls 1' }],
        types: [{ hasDesignatedPorts: false, minimumNotificationPeriod: 4.0, name: 'Préavis type A' }],
        vesselExternalReferenceNumber: 'EXTIMM121',
        vesselFlagCountryCode: 'FR',
        vesselId: 121,
        vesselInternalReferenceNumber: 'CFR121',
        vesselIrcs: 'IRCS121',
        vesselLastControlDateTime: null,
        vesselLength: 7.7,
        vesselMmsi: 'MMSI121',
        vesselName: 'MARE ET BASS'
      }
    ],
    extraData: {
      perSeafrontGroupCount: {
        ALL: 1,
        MED: 0,
        MEMN: 1,
        NAMO: 0,
        NONE: 0,
        OUTREMEROA: 0,
        OUTREMEROI: 0,
        SA: 0
      }
    },
    lastPageNumber: 0,
    pageNumber: 0,
    pageSize: 50,
    totalLength: 1
  }
}

export function getPriorNotificationFakeResponse({
  isManuallyCreated,
  state,
  updatedAt
}: {
  isManuallyCreated: boolean
  state: PriorNotification.State
  updatedAt: string
}): OrUndefinedToOrNull<PriorNotification.Detail> {
  const reportId = isManuallyCreated ? '00000000-0000-4000-0000-000000000000' : 'FAKE_OPERATION_000'
  const createdAt = dayjs().subtract(1, 'hour').toISOString()
  const expectedArrivalDate = dayjs().add(1, 'hour').toISOString()
  const fingerprint = `${reportId}.${updatedAt}.${state}`
  const tripStartDate = dayjs().subtract(8, 'hours').toISOString()

  const commonData: OrUndefinedToOrNull<
    Omit<PriorNotification.Detail, 'asLogbookForm' | 'asManualDraft' | 'asManualForm' | 'isManuallyCreated'>
  > = {
    createdAt,
    fingerprint,
    isLessThanTwelveMetersVessel: true,
    isVesselUnderCharter: false,
    logbookMessage: {
      acknowledgment: null,
      activityDateTime: null,
      externalReferenceNumber: null,
      flagState: 'FRA',
      imo: null,
      integrationDateTime: updatedAt,
      internalReferenceNumber: 'CFR121',
      ircs: null,
      isCorrectedByNewerMessage: false,
      isDeleted: false,
      isSentByFailoverSoftware: false,
      message: {
        authorTrigram: null,
        catchOnboard: [
          {
            conversionFactor: null,
            economicZone: null,
            effortZone: null,
            faoZone: '21.1.C',
            freshness: null,
            nbFish: null,
            packaging: null,
            presentation: null,
            preservationState: null,
            species: 'AGS',
            speciesName: 'SARDINELLE TACHETEE',
            statisticalRectangle: null,
            weight: 50.0
          }
        ],
        catchToLand: [
          {
            conversionFactor: null,
            economicZone: null,
            effortZone: null,
            faoZone: '21.1.C',
            freshness: null,
            nbFish: null,
            packaging: null,
            presentation: null,
            preservationState: null,
            species: 'AGS',
            speciesName: null,
            statisticalRectangle: null,
            weight: 50.0
          }
        ],
        createdBy: 'creator@example.org',
        economicZone: null,
        effortZone: null,
        faoZone: null,
        hasPortEntranceAuthorization: null,
        hasPortLandingAuthorization: null,
        isBeingSent: false,
        isInvalidated: null,
        isInVerificationScope: false,
        isSent: true,
        isVerified: true,
        latitude: null,
        longitude: null,
        note: null,
        pnoTypes: [{ hasDesignatedPorts: false, minimumNotificationPeriod: 4.0, pnoTypeName: 'Préavis type A' }],
        port: 'FRMRS',
        portName: 'Marseille',
        predictedArrivalDatetimeUtc: expectedArrivalDate,
        predictedLandingDatetimeUtc: expectedArrivalDate,
        purpose: PriorNotification.PurposeCode.LAN,
        riskFactor: 3.2,
        statisticalRectangle: null,
        tripStartDate,
        updatedAt,
        updatedBy: 'editor@example.org'
      },
      messageType: Logbook.MessageType.PNO,
      operationDateTime: updatedAt,
      operationNumber: null,
      operationType: Logbook.OperationType.DAT,
      rawMessage: null,
      referencedReportId: null,
      reportDateTime: updatedAt,
      reportId,
      tripGears: [{ dimensions: null, gear: 'OTT', gearName: null, mesh: null }],
      tripNumber: null,
      tripSegments: [{ code: 'MED01', name: 'All Trawls 1' }],
      vesselName: 'MARE ET BASS'
    },
    operationDate: updatedAt,
    reportId,
    riskFactor: 3.2,
    state,
    updatedAt,
    vesselId: 121,
    vesselIdentity: {
      beaconNumber: null,
      districtCode: null,
      externalReferenceNumber: 'EXTIMM121',
      flagState: 'FRA',
      internalReferenceNumber: 'CFR121',
      ircs: 'IRCS121',
      mmsi: 'MMSI121',
      vesselId: null,
      vesselIdentifier: null,
      vesselLength: null,
      vesselName: null
    }
  }

  if (!isManuallyCreated) {
    return {
      ...commonData,
      asLogbookForm: {
        note: null
      },
      asManualDraft: {
        didNotFishAfterZeroNotice: false,
        expectedArrivalDate,
        expectedLandingDate: expectedArrivalDate,
        fishingCatches: [
          { faoArea: null, quantity: null, specyCode: 'AGS', specyName: 'SARDINELLE TACHETEE', weight: 50.0 }
        ],
        globalFaoArea: '21.1.C',
        hasPortEntranceAuthorization: true,
        hasPortLandingAuthorization: true,
        note: null,
        portLocode: 'FRMRS',
        purpose: PriorNotification.PurposeCode.LAN,
        sentAt: updatedAt,
        tripGearCodes: ['OTT'],
        vesselIdentity: {
          beaconNumber: null,
          districtCode: null,
          externalReferenceNumber: 'EXTIMM121',
          flagState: 'FRA',
          internalReferenceNumber: 'CFR121',
          ircs: 'IRCS121',
          mmsi: 'MMSI121',
          vesselId: 121,
          vesselIdentifier: null,
          vesselLength: null,
          vesselName: null
        }
      },
      asManualForm: null,
      isManuallyCreated: false
    }
  }

  return {
    ...commonData,
    asLogbookForm: null,
    asManualDraft: null,
    asManualForm: {
      didNotFishAfterZeroNotice: false,
      expectedArrivalDate,
      expectedLandingDate: expectedArrivalDate,
      fishingCatches: [
        { faoArea: null, quantity: null, specyCode: 'AGS', specyName: 'SARDINELLE TACHETEE', weight: 50.0 }
      ],
      globalFaoArea: '21.1.C',
      hasPortEntranceAuthorization: true,
      hasPortLandingAuthorization: true,
      note: null,
      portLocode: 'FRMRS',
      purpose: PriorNotification.PurposeCode.LAN,
      reportId,
      sentAt: createdAt,
      tripGearCodes: ['OTT'],
      updatedAt,
      vesselIdentity: {
        beaconNumber: null,
        districtCode: null,
        externalReferenceNumber: 'EXTIMM121',
        flagState: 'FRA',
        internalReferenceNumber: 'CFR121',
        ircs: 'IRCS121',
        mmsi: 'MMSI121',
        vesselId: 121,
        vesselIdentifier: null,
        vesselLength: null,
        vesselName: null
      }
    },
    isManuallyCreated: true
  }
}

export function getPriorNotificationSentMessagesFakeResponse({
  length,
  numberOfFailedMessages,
  sentAt
}: {
  length: number
  numberOfFailedMessages: number
  sentAt: string
}): Array<OrUndefinedToOrNull<PriorNotification.SentMessage>> {
  const sentMessages = Array.from(
    { length },
    (_, index) =>
      ({
        communicationMeans: 'EMAIL',
        dateTimeUtc: dayjs(sentAt).subtract(index, 'seconds').toISOString(),
        errorMessage: null,
        id: index + 1,
        recipientAddressOrNumber: `unite${index + 1}@organisation${index + 1}.gouv.fr`,
        recipientName: `Unité ${index + 1}`,
        recipientOrganization: `Organisation ${index + 1}`,
        success: true
      }) satisfies OrUndefinedToOrNull<PriorNotification.SentMessage>
  )

  return sentMessages.reduce<OrUndefinedToOrNull<PriorNotification.SentMessage>[]>((acc, sentMessage, index) => {
    if (index < numberOfFailedMessages) {
      return [
        ...acc,
        {
          ...sentMessage,
          errorMessage: faker.lorem.sentence(),
          success: false
        }
      ]
    }

    return [...acc, sentMessage]
  }, [])
}
