import { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

import type { Seafront } from '@constants/seafront'

export namespace PriorNotification {
  export interface PriorNotification {
    acknowledgment: LogbookMessage.Acknowledgment | undefined
    createdAt: string
    expectedArrivalDate: string | undefined
    expectedLandingDate: string | undefined
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    fingerprint: string
    hasVesselRiskFactorSegments: boolean | undefined
    isBeingSent: boolean
    isCorrection: boolean
    isInVerificationScope: boolean
    isInvalidated: boolean | undefined
    isManuallyCreated: boolean
    isSent: boolean
    isVerified: boolean
    isVesselUnderCharter: boolean | undefined
    onBoardCatches: LogbookMessage.Catch[]
    operationDate: string
    portLocode: string | undefined
    portName: string | undefined
    purposeCode: PurposeCode | undefined
    reportId: string
    reportingCount: number
    riskFactor: number | undefined
    seafront: Seafront | undefined
    sentAt: string | undefined
    state: State | undefined
    tripGears: LogbookMessage.Gear[]
    tripSegments: LogbookMessage.Segment[]
    types: Type[]
    updatedAt: string
    vesselExternalReferenceNumber: string | undefined
    vesselFlagCountryCode: string | undefined
    vesselId: number
    vesselInternalReferenceNumber: string | undefined
    vesselIrcs: string | undefined
    vesselLastControlDateTime: string | undefined
    vesselLength: number | undefined
    vesselMmsi: string | undefined
    vesselName: string | undefined
  }

  export type Identifier = {
    /** `operationDate` is used in Backend SQL query to optimize Timescale index usage. */
    operationDate: string
    reportId: string
  }

  export type Detail = {
    fingerprint: string
    isLessThanTwelveMetersVessel: boolean
    isManuallyCreated: boolean
    isVesselUnderCharter: boolean | undefined
    logbookMessage: LogbookMessage.PnoLogbookMessage
    operationDate: string
    /** Logbook message `reportId`. */
    reportId: string
    riskFactor: number | undefined
    state: State | undefined
  }

  export type LogbookFormData = {
    authorTrigram: string | undefined
    note: string | undefined
  }

  export type ManualFormData = {
    authorTrigram: string
    didNotFishAfterZeroNotice: boolean
    expectedArrivalDate: string
    expectedLandingDate: string
    fishingCatches: FormDataFishingCatch[]
    globalFaoArea: string | undefined
    hasPortEntranceAuthorization: boolean
    hasPortLandingAuthorization: boolean
    note: string | undefined
    portLocode: string
    purpose: PurposeCode
    reportId: string
    sentAt: string
    tripGearCodes: string[]
    updatedAt: string
    vesselId: number
  }
  export type NewManualFormData = Omit<ManualFormData, 'reportId'>

  export type LogbookComputeRequestData = {
    isInVerificationScope: boolean
    portLocode: string
    segmentCodes: string[]
    vesselId: number
  }
  /** Real-time computed values displayed within a prior notification form. */
  export type LogbookComputedValues = {
    /** Next initial state of the prior notification once it will be created or updated. */
    nextState: State
  }

  export type ManualComputeRequestData = Pick<
    ManualFormData,
    'fishingCatches' | 'globalFaoArea' | 'portLocode' | 'tripGearCodes' | 'vesselId'
  >
  /** Real-time computed values displayed within a prior notification form. */
  export type ManualComputedValues = Pick<
    PriorNotification,
    'isVesselUnderCharter' | 'tripSegments' | 'types' | 'riskFactor'
  > & {
    /** Next initial state of the prior notification once it will be created or updated. */
    nextState: State
  }

  export type FormDataFishingCatch = {
    faoArea?: string | undefined
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
    // "Access to services"
    ACS: 'Accès aux services',
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

  export enum State {
    /** "Envoi auto. fait". */
    AUTO_SEND_DONE = 'AUTO_SEND_DONE',
    /** "Envoi auto. demandé". */
    AUTO_SEND_REQUESTED = 'AUTO_SEND_REQUESTED',
    /** "Échec de diffusion". */
    FAILED_SEND = 'FAILED_SEND',
    /** "Hors vérification". */
    OUT_OF_VERIFICATION_SCOPE = 'OUT_OF_VERIFICATION_SCOPE',
    /** "Envoi auto. en cours". */
    PENDING_AUTO_SEND = 'PENDING_AUTO_SEND',
    /** "Diffusion en cours". */
    PENDING_SEND = 'PENDING_SEND',
    /** "À vérifier (CNSP)". */
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
    /** "Vérifié et diffusé". */
    VERIFIED_AND_SENT = 'VERIFIED_AND_SENT'
  }
  export const STATE_LABEL: Record<State, string> = {
    AUTO_SEND_DONE: 'Envoi auto. fait',
    AUTO_SEND_REQUESTED: 'Envoi auto. demandé',
    FAILED_SEND: 'Échec de diffusion',
    OUT_OF_VERIFICATION_SCOPE: 'Hors vérification',
    PENDING_AUTO_SEND: 'Envoi auto. en cours',
    PENDING_SEND: 'Diffusion en cours',
    PENDING_VERIFICATION: 'À vérifier (CNSP)',
    VERIFIED_AND_SENT: 'Vérifié et diffusé'
  }
  export const STATE_LABELS_AS_OPTIONS = getOptionsFromLabelledEnum(STATE_LABEL, true)
}
