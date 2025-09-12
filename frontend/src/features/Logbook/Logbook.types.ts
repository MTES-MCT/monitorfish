import type { AllSeafrontGroup, NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export namespace Logbook {
  export type Message =
    | PnoMessage
    | FarMessage
    | CoeMessage
    | CoxMessage
    | CpsMessage
    | CroMessage
    | DepMessage
    | DisMessage
    | EofMessage
    | LanMessage
    | RtpMessage
    | EmptyMessage

  interface MessageBase {
    acknowledgment: Acknowledgment | undefined
    activityDateTime: string | undefined
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

  export interface FarMessage extends MessageBase {
    message: FarMessageValue
    messageType: MessageType.FAR
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface PnoMessage extends MessageBase {
    message: PnoMessageValue
    messageType: MessageType.PNO
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface CoeMessage extends MessageBase {
    message: CoeMessageValue
    messageType: MessageType.COE
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface CoxMessage extends MessageBase {
    message: CoxMessageValue
    messageType: MessageType.COX
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface CpsMessage extends MessageBase {
    message: CpsMessageValue
    messageType: MessageType.CPS
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface CroMessage extends MessageBase {
    message: CroMessageValue
    messageType: MessageType.CRO
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface DepMessage extends MessageBase {
    message: DepMessageValue
    messageType: MessageType.DEP
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface DisMessage extends MessageBase {
    message: DisMessageValue
    messageType: MessageType.DIS
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface EofMessage extends MessageBase {
    message: EofMessageValue
    messageType: MessageType.EOF
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface LanMessage extends MessageBase {
    message: LanMessageValue
    messageType: MessageType.LAN
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface RtpMessage extends MessageBase {
    message: RtpMessageValue
    messageType: MessageType.RTP
    operationType: OperationType.COR | OperationType.DAT
  }

  export interface EmptyMessage extends MessageBase {
    message: undefined
    messageType: MessageType.INS
    operationType: OperationType.COR | OperationType.DAT
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

  export type Gear = {
    dimensions: string | undefined
    gear: string | undefined
    gearName: string | undefined
    mesh: number | undefined
  }

  type MessageValue =
    | FarMessageValue
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
    economicZoneEntered: string | undefined
    effortZoneEntered: string | undefined
    effortZoneEntryDatetimeUtc: string | undefined
    faoZoneEntered: string | undefined
    latitudeEntered: number | undefined
    longitudeEntered: number | undefined
    statisticalRectangleEntered: string | undefined
    targetSpeciesNameOnEntry: string | undefined
    targetSpeciesOnEntry: string | undefined
  }

  export interface CoxMessageValue {
    economicZoneExited: string | undefined
    effortZoneExitDatetimeUtc: string | undefined
    effortZoneExited: string | undefined
    faoZoneExited: string | undefined
    latitudeExited: number | undefined
    longitudeExited: number | undefined
    statisticalRectangleExited: string | undefined
    targetSpeciesNameOnExit: string | undefined
    targetSpeciesOnExit: string | undefined
  }

  export interface CpsMessageValue {
    catches: ProtectedSpeciesCatch[]
    cpsDatetimeUtc: string | undefined
    dimensions: string | undefined
    gear: string | undefined
    gearName: string | undefined
    latitude: number | undefined
    longitude: number | undefined
    mesh: number | undefined
  }

  export interface CroMessageValue {
    economicZoneEntered: string | undefined
    economicZoneExited: string | undefined
    effortZoneEntered: string | undefined
    effortZoneEntryDatetimeUtc: string | undefined
    effortZoneExitDatetimeUtc: string | undefined
    effortZoneExited: string | undefined
    faoZoneEntered: string | undefined
    faoZoneExited: string | undefined
    latitudeEntered: number | undefined
    latitudeExited: number | undefined
    longitudeEntered: number | undefined
    longitudeExited: number | undefined
    statisticalRectangleEntered: string | undefined
    statisticalRectangleExited: string | undefined
    targetSpeciesNameOnEntry: string | undefined
    targetSpeciesNameOnExit: string | undefined
    targetSpeciesOnEntry: string | undefined
    targetSpeciesOnExit: string | undefined
  }

  export interface DepMessageValue {
    anticipatedActivity: string | undefined
    departureDatetimeUtc: string | undefined
    departurePort: string | undefined
    departurePortName: string | undefined
    gearOnboard: Gear[]
    speciesOnboard: Catch[]
    tripStartDate: string | undefined
  }

  export interface DisMessageValue {
    catches: Catch[]
    discardDatetimeUtc: string | undefined
  }

  export interface EofMessageValue {
    endOfFishingDatetimeUtc: string | undefined
  }

  export interface FarMessageValue {
    hauls: Haul[]
  }

  export interface Haul {
    catches: Catch[]
    dimensions: string | undefined
    farDatetimeUtc: string | undefined
    gear: string | undefined
    gearName: string | undefined
    latitude: number | undefined
    longitude: number | undefined
    mesh: number | undefined
  }

  export interface LanMessageValue {
    catchLanded: Catch[]
    landingDatetimeUtc: string | undefined
    port: string | undefined
    portName?: string | undefined
    sender?: string | undefined
  }

  export interface PnoMessageValue {
    /**
     * @deprecated
     * Kept because some historical messages used a manually entered trigram to identify the author of the message.
     *
     * It's now automated via `createdBy` and `updatedBy` fields.
     */
    authorTrigram: string | undefined
    catchOnboard: Catch[]
    catchToLand: Catch[]
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
    updatedAt: string | undefined
    updatedBy: string | undefined
  }

  export interface RtpMessageValue {
    gearOnboard: Gear[]
    port: string | undefined
    portName: string | undefined
    reasonOfReturn: string | undefined
    returnDatetimeUtc: string | undefined
  }

  export type MessagePnoType = {
    hasDesignatedPorts: boolean
    minimumNotificationPeriod: number
    pnoTypeName: string
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
    endDate: string | undefined
    isFirstVoyage: boolean
    isLastVoyage: boolean
    logbookMessages: Message[]
    software: string | undefined
    startDate: string | undefined
    totalTripsFoundForDates: number | undefined
    tripNumber: string
    vesselIdentity: Vessel.VesselIdentity
  }

  // ---------------------------------------------------------------------------
  // Constants

  export enum HealthState {
    DEA,
    ALI,
    INJ
  }

  export enum Fate {
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

    /**
     * Notification d'entrée dans une zone d'effort
     */
    'NOT-COE' = 'NOT-COE',

    /**
     * Notification de sortie d'une zone d'effort
     */
    'NOT-COX' = 'NOT-COX',

    /**
     * Notification de transbordement
     */
    'NOT-TRA' = 'NOT-TRA',

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
     * Rejets minimis.
     *
     * @description
     * Rejets minimis, only used in France.
     */
    DIM = 'DIM',

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
    TRZ = 'TRZ',

    /**
     * Sortie de l'eau d`engin
     */
    'GEAR-RETRIEVAL' = 'GEAR-RETRIEVAL',

    /**
     * Mise à l'eau d'engin
     */
    'GEAR-SHOT' = 'GEAR-SHOT',

    /**
     * Pré-notification de transfert
     */
    PNT = 'PNT',

    /**
     * Opération de pêche conjointe
     */
    JFO = 'JFO',

    /**
     * Début d'activité de pêche
     */
    'START-ACTIVITY' = 'START-ACTIVITY',

    /**
     * Début de pêche
     */
    'START-FISHING' = 'START-FISHING'
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

  // ---------------------------------------------------------------------------
  // API

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
