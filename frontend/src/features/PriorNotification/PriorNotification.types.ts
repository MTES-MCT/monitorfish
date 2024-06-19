import type { Seafront } from '@constants/seafront'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export namespace PriorNotification {
  export interface PriorNotification {
    acknowledgment: LogbookMessage.Acknowledgment | undefined
    createdAt: string
    expectedArrivalDate: string | undefined
    expectedLandingDate: string | undefined
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    fingerprint: string
    hasVesselRiskFactorSegments: boolean | undefined
    /** Logbook message `reportId`. */
    id: string
    isCorrection: boolean
    isManuallyCreated: boolean
    isVesselUnderCharter: boolean | undefined
    onBoardCatches: LogbookMessage.Catch[]
    portLocode: string | undefined
    portName: string | undefined
    purposeCode: PurposeCode | undefined
    reportingCount: number
    seafront: Seafront | undefined
    sentAt: string | undefined
    tripGears: LogbookMessage.Gear[]
    tripSegments: LogbookMessage.Segment[]
    types: Type[]
    updatedAt: string
    vesselExternalReferenceNumber: string | undefined
    vesselFlagCountryCode: string | undefined
    vesselId: number
    vesselInternalReferenceNumber: string | undefined
    vesselIrcs: string | undefined
    vesselLastControlDate: string | undefined
    vesselLength: number | undefined
    vesselMmsi: string | undefined
    vesselName: string | undefined
    vesselRiskFactor: number | undefined
    vesselRiskFactorDetectability: number | undefined
    vesselRiskFactorImpact: number | undefined
    vesselRiskFactorProbability: number | undefined
  }

  export type PriorNotificationDetail = {
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    fingerprint: string
    /** Logbook message `reportId`. */
    id: string
    isLessThanTwelveMetersVessel: boolean
    logbookMessage: LogbookMessage.PnoLogbookMessage
  }

  export type ManualPriorNotificationData = {
    authorTrigram: string
    didNotFishAfterZeroNotice: boolean
    expectedArrivalDate: string
    expectedLandingDate: string
    faoArea: string
    fishingCatches: PriorNotificationDataFishingCatch[]
    note: string | undefined
    portLocode: string
    reportId: string
    sentAt: string
    tripGearCodes: string[]
    vesselId: number
  }
  export type NewManualPriorNotificationData = Omit<ManualPriorNotificationData, 'reportId'>

  export type ManualPriorNotificationComputeRequestData = Pick<
    ManualPriorNotificationData,
    'faoArea' | 'fishingCatches' | 'portLocode' | 'tripGearCodes' | 'vesselId'
  >
  export type ManualPriorNotificationComputedValues = Pick<
    PriorNotification,
    'tripSegments' | 'types' | 'vesselRiskFactor'
  >

  export type PriorNotificationDataFishingCatch = {
    quantity?: number | undefined
    specyCode: string
    specyName: string
    weight: number
  }

  export type Type = {
    hasDesignatedPorts: boolean
    minimumNotificationPeriod: number
    name: string
  }

  export enum PurposeCode {
    ACS = 'ACS',
    ECY = 'ECY',
    GRD = 'GRD',
    LAN = 'LAN',
    OTH = 'OTH',
    REF = 'REF',
    REP = 'REP',
    RES = 'RES',
    SCR = 'SCR',
    SHE = 'SHE',
    TRA = 'TRA'
  }
  export const PURPOSE_LABEL: Record<PurposeCode, string> = {
    // TODO Find out what this purpose code means.
    ACS: 'Non supporté',
    // "Emergency"
    ECY: 'Urgence',
    // "Vessels grounded and called by the authorities"
    GRD: 'Immobilisation et convocation par les autorités',
    // "Landing"
    LAN: 'Débarquement',
    // "Other"
    OTH: 'Autre',
    // "Refueling"
    REF: 'Ravitaillement',
    // "Repair"
    REP: 'Réparation',
    // "Rest"
    RES: 'Repos',
    // "Return for Scientific Research"
    SCR: 'Retour pour Recherche Scientifique',
    // "Sheltering"
    SHE: 'Mise à l’abri',
    // "Transhipment"
    TRA: 'Transbordement'
  }
}
