import type { Undefine, UndefineExcept } from '@mtes-mct/monitor-ui'

export namespace LogbookMessage {
  export type LogbookMessage = {
    acknowledge: Acknowledge | undefined
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

  export type Acknowledge = {
    dateTime: string | undefined
    isSuccess: boolean
    rejectionCause: string | undefined
    returnStatus: string | undefined
  }

  export type Catch = UndefineExcept<
    {
      conversionFactor: number
      economicZone: string
      effortZone: string
      faoZone: string
      freshness: string
      numberFish: number
      packaging: string
      presentation: string
      preservationState: string
      species: string
      speciesName: string
      statisticalRectangle: string
      weight: number
    },
    'species'
  >

  export type Message = Undefine<{
    catchOnboard: MessageCatchOnboard[]
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

  export type MessageCatchOnboard = {
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
    hasDesignatedPorts: boolean
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
    code: string
    name: string
  }

  export type ApiFilter = Partial<
    Undefine<{
      flagStates: string[]
      isLessThanTwelveMetersVessel: boolean
      lastControlledAfter: string
      lastControlledBefore: string
      portLocodes: string[]
      priorNotificationTypesAsOptions: string[]
      searchQuery: string
      specyCodes: string[]
      tripGearCodes: string[]
      tripSegmentSegments: string[]
      vesselLength: number
      willArriveAfter: string
      willArriveBefore: string
    }>
  >
}
