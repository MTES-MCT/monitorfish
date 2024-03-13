import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export namespace LogbookMessage {
  export type LogbookMessage = {
    acknowledge: Aknowledge | undefined
    deleted: boolean
    externalReferenceNumber: string
    flagState: string
    imo: string | undefined
    integrationDateTime: string
    internalReferenceNumber: string
    ircs: string
    isCorrected: boolean
    isSentByFailoverSoftware: boolean
    message: Message
    messageType: string
    operationDateTime: string
    operationNumber: string
    operationType: string
    rawMessage: string
    referencedReportId: string | undefined
    reportDateTime: string
    reportId: string
    tripNumber: string
    vesselName: string
  }

  export type Aknowledge = {
    dateTime: string | undefined
    isSuccess: boolean
    rejectionCause: string | undefined
    returnStatus: string | undefined
  }

  export type Message = Undefine<{
    catchOnboard: MessageCatchonboard[]
    economicZone: string
    effortZone: string
    faoZone: string
    latitude: string
    longitude: string
    pnoTypes: MessagePnoType[]
    /** Port code. */
    port: string
    portName: string
    predictedArrivalDatetimeUtc: string
    predictedLandingDatetimeUtc: string
    purpose: string
    statisticalRectangle: string
    tripStartDate: string
  }>

  export type MessageCatchonboard = {
    conversionFactor: number
    economicZone: string
    effortZone: string
    faoZone: string
    freshness: string
    nbFish: number
    packaging: string
    presentation: string
    preservationState: string
    species: string
    speciesName: string
    statisticalRectangle: string
    weight: number
  }

  export type MessagePnoType = {
    hasDesignated_ports: boolean
    minimumNotificationPeriod: number
    // TODO Replace that with an enum.
    pnoTypeName: string
  }

  export type TripGear = {
    dimensions: string
    /** Gear code. */
    gear: string
    mesh: number
  }

  export type TripSegment = {
    segment: string
    segmentName: string
  }

  export type ApiFilter = Undefine<{
    flagStates: string[]
    integratedAfter: string
    integratedBefore: string
    portLocodes: string[]
    searchQuery: string
    specyCodes: string[]
    tripGearCodes: string[]
    tripSegmentSegments: string[]
    vesselId: Vessel.VesselId
  }>
}
