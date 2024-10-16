import type { LogbookMessage } from './LegacyLogbook.types'
import type { AllSeafrontGroup, NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

export namespace Logbook {
  export type Message = PnoMessage | RetOperationMessage

  interface MessageBase {
    acknowledgment: Acknowledgment | undefined
    externalReferenceNumber: string | undefined
    flagState: string | undefined
    imo: string | undefined
    integrationDateTime: string
    internalReferenceNumber: string
    ircs: string | undefined
    isCorrectedByNewerMessage: boolean
    isDeleted: boolean
    isSentByFailoverSoftware: boolean
    message: MessageValue | undefined
    messageType: MessageType
    operationDateTime: string
    operationNumber: string | undefined
    operationType: OperationType
    rawMessage: string | undefined
    referencedReportId: string | undefined
    reportDateTime: string
    reportId: string
    tripGears: Gear[] | undefined
    tripNumber: string | undefined
    tripSegments: Segment[] | undefined
    vesselName: string
  }

  export interface PnoMessage extends MessageBase {
    acknowledgment: undefined
    message: PnoMessageValue
    messageType: MessageType.PNO
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface RetOperationMessage extends MessageBase {
    acknowledgment: Acknowledgment
    message: undefined
    messageType: MessageType
    operationType: OperationType.RET
  }

  export type Acknowledgment = {
    dateTime: string | undefined
    isSuccess: boolean
    rejectionCause: string | undefined
    returnStatus: string | undefined
  }

  export type Catch = {
    conversionFactor: number | undefined
    economicZone: string | undefined
    effortZone: string | undefined
    faoZone: string | undefined
    freshness: string | undefined
    nbFish: number | undefined
    packaging: string | undefined
    presentation: string | undefined
    preservationState: string | undefined
    species: string
    speciesName: string | undefined
    statisticalRectangle: string | undefined
    weight: number | undefined
  }

  // TODO Replace `| null` by `| undefined` after deleting Gear in logbook.types.ts
  export type Gear = {
    dimensions: string | null
    gear: string | null
    gearName: string | null
    mesh: number | null
  }

  type MessageValue =
    | CoeMessageValue
    | CoxMessageValue
    | CpsMessageValue
    | CroMessageValue
    | DepMessageValue
    | DisMessageValue
    | EofMessageValue
    | LanMessageValue
    | PnoMessageValue
    | RtpMessageValue

  export interface CoeMessageValue {
    economicZoneEntered: string
    effortZoneEntryDatetimeUtc: string
    faoZoneEntered: string
    latitudeEntered: number
    longitudeEntered: number
    statisticalRectangleEntered: string
    targetSpeciesNameOnEntry: string
    targetSpeciesOnEntry: string
  }

  export interface CoxMessageValue {
    economicZoneExited: string
    effortZoneExitDatetimeUtc: string
    faoZoneExited: string
    latitudeExited: number
    longitudeExited: number
    statisticalRectangleExited: string
    targetSpeciesNameOnExit: string
    targetSpeciesOnExit: string
  }

  export interface CpsMessageValue {
    catches: ProtectedSpeciesCatch[]
    cpsDatetimeUtc?: string
    dimensions?: string
    gear?: string
    gearName?: string
    latitude?: number
    longitude?: number
    mesh?: number
  }

  export interface CroMessageValue {
    effortZoneEntryDatetimeUtc: string
    effortZoneExitDatetimeUtc: string
    latitudeEntered: number
    latitudeExited: number
    longitudeEntered: number
    longitudeExited: number
  }

  export interface DepMessageValue {
    anticipatedActivity: string
    departureDatetimeUtc: string
    departurePort: string
    departurePortName: string
    gearOnboard: Gear[]
    speciesOnboard: {
      species: string
      speciesName: string
      weight: number
    }[]
  }

  export interface DisMessageValue {
    catches: Catch[]
    discardDatetimeUtc: string
    latitude: number
    longitude: number
  }

  export interface EofMessageValue {
    endOfFishingDatetimeUtc: string
  }
  export interface LanMessageValue {
    catchLanded: Catch[]
    landingDatetimeUtc: string
    port: string
    portName?: string
    sender?: string
  }

  export interface PnoMessageValue {
    /**
     * @deprecated
     * Kept because some historical messages used a manually entered trigram to identify the author of the message.
     *
     * It's now automated via `createdBy` and `updatedBy` fields.
     */
    authorTrigram: string | undefined
    catchOnboard: Catch[] | undefined
    catchToLand: Catch[] | undefined
    createdBy: string | undefined
    economicZone: string | undefined
    effortZone: string | undefined
    faoZone: string | undefined
    hasPortEntranceAuthorization: boolean | undefined
    hasPortLandingAuthorization: boolean | undefined
    isBeingSent: boolean | undefined
    isInVerificationScope: boolean | undefined
    isInvalidated: boolean | undefined
    isSent: boolean | undefined
    isVerified: boolean | undefined
    latitude: string | undefined
    longitude: string | undefined
    note: string | undefined
    pnoTypes: MessagePnoType[] | undefined
    /** Port code. */
    port: string | undefined
    portName: string | undefined
    predictedArrivalDatetimeUtc: string | undefined
    predictedLandingDatetimeUtc: string | undefined
    purpose: PriorNotification.PurposeCode | undefined
    riskFactor: number | undefined
    statisticalRectangle: string | undefined
    tripStartDate: string | undefined
    /**
     * @internal
     * This `updatedAt` field is only used internally for logbook PNOs. It's always `undefined` for manual ones.
     *
     * /!\ Use `PriorNotification.PriorNotification.updatedAt` or `PriorNotification.Detail.updatedAt` instead.
     */
    updatedAt: string | undefined
    updatedBy: string | undefined
  }

  export interface RtpMessageValue {
    gearOnboard: Gear[]
    port: string
    portName: string
    reasonOfReturn: string
    returnDatetimeUtc: string
  }

  export type MessagePnoType = {
    hasDesignatedPorts: boolean
    minimumNotificationPeriod: number
    pnoTypeName: string
  }

  export type PNOAndLANWeightToleranceAlert = {
    externalReferenceNumber: string
    id: string
    internalReferenceNumber: string
    ircs: string
    value: PNOAndLANWeightToleranceAlertValue
    vesselIdentifier: string
    vesselName: string
  }

  export type PNOAndLANWeightToleranceAlertValue = {
    catchesOverTolerance: PNOAndLANWeightToleranceAlertValueCatches[]
    lanOperationNumber: string
    minimumWeightThreshold: number
    name: string
    percentOfTolerance: number
    pnoOperationNumber: string
    type: 'PNO_LAN_WEIGHT_TOLERANCE_ALERT'
  }

  export type PNOAndLANWeightToleranceAlertValueCatches = {
    lan: Object
    pno: Object
  }

  export type ProtectedSpeciesCatch = {
    careMinutes?: number
    comment?: string
    economicZone?: string
    effortZone?: string
    faoZone?: string
    fate?: Fate
    healthState?: HealthState
    nbFish?: number
    ring?: number
    sex?: string
    species: string
    speciesName?: string
    statisticalRectangle?: string
    weight?: number
  }

  export type VesselVoyage = {
    endDate: string | null
    isFirstVoyage: boolean
    isLastVoyage: boolean
    logbookMessagesAndAlerts: FishingActivities
    startDate: string | null
    tripNumber: string
    vesselIdentity: VesselIdentity
  }

  export type FishingActivities = {
    alerts: PNOAndLANWeightToleranceAlert[]
    logbookMessages: LogbookMessage[]
  }

  // ---------------------------------------------------------------------------
  // Constants

  enum HealthState {
    DEA,
    ALI,
    INJ
  }

  enum Fate {
    DIS,
    HEC,
    DEA
  }

  /* eslint-disable typescript-sort-keys/string-enum */
  /** @see https://faolex.fao.org/docs/pdf/eur97393.pdf */
  export enum MessageType {
    /**
     * Entry in zone declaration.
     *
     * @description
     * Required for vessels entering fishing zones, particularly those with conservation measures.
     */
    COE = 'COE',

    /**
     * Exit from zone declaration.
     *
     * @description
     * Required for vessels exiting fishing zones, particularly those with conservation measures.
     */
    COX = 'COX',

    /** Dolphins capture declaration (specific to France). */
    CPS = 'CPS',

    /**
     * Crossing of zone declaration.
     *
     * @description
     * Indicates a vessel has crossed a specific zone, potentially subject to regulations.
     */
    CRO = 'CRO',

    /**
     * Departure declaration.
     *
     * @description
     * Must be transmitted every time a vessel departs from port.
     * Required on every departure from port, to be sent in next message.
     */
    DEP = 'DEP',

    /**
     * Discard declaration.
     *
     * @description
     * Details of fish discarded during fishing operations.
     */
    DIS = 'DIS',

    /**
     * End of fishing declaration.
     *
     * @description
     * Transmitted immediately after the last fishing operation before returning to port.
     */
    EOF = 'EOF',

    /**
     * Fishing Activity Report.
     *
     * @description
     * Required daily or upon request, detailing fishing activities.
     * Required by midnight on each day at sea or in response to a request from the flag state.
     */
    FAR = 'FAR',

    /**
     * Landing declaration.
     *
     * @description
     * To be transmitted after landing of catch.
     */
    LAN = 'LAN',

    /**
     * Prior notification of return declaration.
     *
     * @description
     * Transmitted prior to returning to port or as required by regulations.
     */
    PNO = 'PNO',

    /** Return to port declaration.
     *
     * @description
     * To be transmitted upon entry into port, after any prior notification and before landing fish.
     */
    RTP = 'RTP',

    // -------------------------------------------------------------------------
    // Not implemented

    /**
     * Inspection declaration.
     *
     * @description
     * To be provided by the authorities, but not the master.
     */
    INS = 'INS',

    /**
     * Relocation of Catch.
     *
     * @description
     * Used when catch (all or parts thereof) is transferred or moved from shared fishing gear to a vessel or from a
     * vessel’s hold or its fishing gear to a keep net, container or cage (outside the vessel) in which the live catch
     * is kept until landing.
     */
    RLC = 'RLC',

    /**
     * Transhipment.
     *
     * @description
     * For every transhipment of catch, declaration required from both donor and recipient.
     */
    TRA = 'TRA',

    /**
     * Trans-zonal fishing declaration.
     *
     * @description
     * If carrying out Trans-zonal fishing.
     */
    TRZ = 'TRZ'
  }
  /* eslint-enable typescript-sort-keys/string-enum */

  /**
   * @description
   * Operations element: this is the top level envelope of all operations sent to the web service operation.
   * OPS element must contain one of the sub-elements DAT, RET, DEL, COR, QUE, RSP.
   *
   * @see https://faolex.fao.org/docs/pdf/eur97393.pdf
   */
  export enum OperationType {
    /** Correction operation to ask another MS to correct previously sent data. */
    COR = 'COR',
    /** Data operation to push log book or sales note information to another MS. */
    DAT = 'DAT',
    /** Delete operation to ask receiving MS to delete previously sent data */
    DEL = 'DEL',
    /** Acknowledgement operation to reply to DAT, DEL or COR operation. */
    RET = 'RET'
  }

  export type Segment = {
    code: string
    name: string
  }

  export type ApiListExtraData = {
    perSeafrontGroupCount: Record<SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup, number>
  }

  export type ApiFilter = Partial<{
    flagStates: string[] | undefined
    hasOneOrMoreReportings: boolean | undefined
    isInvalidated: boolean | undefined
    isLessThanTwelveMetersVessel: boolean | undefined
    isPriorNotificationZero: boolean | undefined
    lastControlledAfter: string | undefined
    lastControlledBefore: string | undefined
    portLocodes: string[] | undefined
    priorNotificationTypes: string[] | undefined
    seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup | undefined
    searchQuery: string | undefined
    specyCodes: string[] | undefined
    states: PriorNotification.State[] | undefined
    tripGearCodes: string[] | undefined
    tripSegmentCodes: string[] | undefined
    vesselLength: number | undefined
    willArriveAfter: string
    willArriveBefore: string
  }>
  export enum ApiSortColumn {
    EXPECTED_ARRIVAL_DATE = 'EXPECTED_ARRIVAL_DATE',
    EXPECTED_LANDING_DATE = 'EXPECTED_LANDING_DATE',
    PORT_NAME = 'PORT_NAME',
    VESSEL_NAME = 'VESSEL_NAME',
    VESSEL_RISK_FACTOR = 'VESSEL_RISK_FACTOR'
  }
}
