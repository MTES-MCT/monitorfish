import type { AllSeafrontGroup, NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export namespace LogbookMessage {
  export type LogbookMessage = PnoLogbookMessage | RetOperationLogbookMessage

  interface LogbookMessageBase {
    acknowledgment: Acknowledgment | undefined
    createdAt: string
    externalReferenceNumber: string
    flagState: string | undefined
    imo: string | undefined
    integrationDateTime: string
    internalReferenceNumber: string
    ircs: string
    isCorrectedByNewerMessage: boolean
    isDeleted: boolean
    isManuallyCreated: boolean
    isSentByFailoverSoftware: boolean
    message: MessageBase | undefined
    messageType: MessageType
    operationDateTime: string
    operationNumber: string | undefined
    operationType: OperationType
    rawMessage: string
    referencedReportId: string | undefined
    reportDateTime: string
    reportId: string
    tripGears: Gear[] | undefined
    tripNumber: string | undefined
    tripSegments: Segment[] | undefined
    updatedAt: string
    vesselName: string
  }
  export interface PnoLogbookMessage extends LogbookMessageBase {
    acknowledgment: undefined
    message: PnoMessage
    messageType: MessageType.PNO
    operationType: OperationType.COR | OperationType.DAT
  }
  export interface RetOperationLogbookMessage extends LogbookMessageBase {
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
    numberFish: number | undefined
    packaging: string | undefined
    presentation: string | undefined
    preservationState: string | undefined
    species: string
    speciesName: string | undefined
    statisticalRectangle: string | undefined
    weight: number | undefined
  }

  export type Gear = {
    dimensions: string
    gear: string
    // TODO Replace null by undefined after deleting Gear in logbook.types.ts
    gearName: string | null
    mesh: number
  }

  interface MessageBase {}
  export interface PnoMessage extends MessageBase {
    catchOnboard: Catch[] | undefined
    economicZone: string | undefined
    effortZone: string | undefined
    faoZone: string | undefined
    latitude: string | undefined
    longitude: string | undefined
    pnoTypes: MessagePnoType[] | undefined
    /** Port code. */
    port: string | undefined
    portName: string | undefined
    predictedArrivalDatetimeUtc: string | undefined
    predictedLandingDatetimeUtc: string | undefined
    purpose: PriorNotification.PurposeCode | undefined
    statisticalRectangle: string | undefined
    tripStartDate: string | undefined
  }

  export type MessagePnoType = {
    hasDesignatedPorts: boolean
    minimumNotificationPeriod: number
    pnoTypeName: string
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
    isLessThanTwelveMetersVessel: boolean | undefined
    lastControlledAfter: string | undefined
    lastControlledBefore: string | undefined
    portLocodes: string[] | undefined
    priorNotificationTypes: string[] | undefined
    seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup | undefined
    searchQuery: string | undefined
    specyCodes: string[] | undefined
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
