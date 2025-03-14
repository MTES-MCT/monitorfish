import { Logbook } from '@features/Logbook/Logbook.types'

import type { Seafront } from '@constants/seafront'
import type { Vessel } from '@features/Vessel/Vessel.types'

export namespace PriorNotification {
  export interface PriorNotification {
    acknowledgment: Logbook.Acknowledgment | undefined
    expectedArrivalDate: string | undefined
    expectedLandingDate: string | undefined
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    fingerprint: string
    isCorrection: boolean
    isInvalidated: boolean | undefined
    isManuallyCreated: boolean
    isPriorNotificationZero: boolean
    isVesselUnderCharter: boolean | undefined
    onBoardCatches: Logbook.Catch[]
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
    tripGears: Logbook.Gear[]
    tripSegments: Logbook.Segment[]
    types: Type[]
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
    createdAt: string
    fingerprint: string
    isLessThanTwelveMetersVessel: boolean
    isVesselUnderCharter: boolean | undefined
    logbookMessage: Logbook.PnoMessage
    operationDate: string
    /** Logbook message `reportId`. */
    reportId: string
    riskFactor: number | undefined
    state: State | undefined
    updatedAt: string
    vesselId: number
    vesselIdentity: Vessel.VesselIdentity
  } & (
    | {
        asLogbookForm: LogbookForm
        asManualDraft: ManualDraft
        asManualForm: undefined
        isManuallyCreated: false
      }
    | {
        asLogbookForm: undefined
        asManualDraft: undefined
        asManualForm: ApiManualCreateOrUpdateResponseData
        isManuallyCreated: true
      }
  )

  export type ManualDraft = {
    didNotFishAfterZeroNotice: boolean
    expectedArrivalDate: string | undefined
    expectedLandingDate: string | undefined
    fishingCatches: FormDataFishingCatch[]
    globalFaoArea: string | undefined
    hasPortEntranceAuthorization: boolean
    hasPortLandingAuthorization: boolean
    note: string | undefined
    portLocode: string | undefined
    purpose: PurposeCode | undefined
    sentAt: string | undefined
    tripGearCodes: string[]
    vesselIdentity: Vessel.VesselIdentity | undefined
  }

  export type LogbookForm = {
    note: string | undefined
  }

  export type ManualForm = {
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
    sentAt: string
    tripGearCodes: string[]
    updatedAt: string
    vesselIdentity: Vessel.VesselIdentity
  }

  /** Real-time computed values displayed within a logbook prior notification form. */
  export type LogbookComputedValues = {
    /** Next initial state of the prior notification once it will be created or updated. */
    nextState: State
  }

  /** Real-time computed values displayed within a manual prior notification form. */
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

  export type SentMessage = {
    communicationMeans: 'EMAIL' | 'FAX' | 'SMS'
    dateTimeUtc: string
    errorMessage: string | undefined
    id: number
    recipientAddressOrNumber: string
    recipientName: string
    recipientOrganization: string
    success: boolean
  }

  export type Upload = {
    createdAt: string
    fileName: string
    id: string
    isManualPriorNotification: boolean
    mimeType: string
    reportId: string
    updatedAt: string
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

  // ---------------------------------------------------------------------------
  // API

  export type ApiManualComputeRequestData = Pick<
    ManualForm,
    'fishingCatches' | 'globalFaoArea' | 'portLocode' | 'tripGearCodes'
  > & {
    vesselId: number
    year: number
  }

  export type ApiManualCreateOrUpdateRequestData = Omit<ManualForm, 'reportId' | 'vesselIdentity'> & {
    vesselId: number
  }
  export type ApiManualCreateOrUpdateResponseData = ManualForm & {
    reportId: string
  }
}
