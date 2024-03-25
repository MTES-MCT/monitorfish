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

  export type Message = {
    catchOnboard: MessageCatchOnboard[] | undefined
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
    purpose: string | undefined
    statisticalRectangle: string | undefined
    tripStartDate: string | undefined
  }

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

  export type ApiFilter = Partial<{
    flagStates: string[] | undefined
    isLessThanTwelveMetersVessel: boolean | undefined
    lastControlledAfter: string | undefined
    lastControlledBefore: string | undefined
    portLocodes: string[] | undefined
    priorNotificationTypesAsOptions: string[] | undefined
    searchQuery: string | undefined
    specyCodes: string[] | undefined
    tripGearCodes: string[] | undefined
    tripSegmentSegments: string[] | undefined
    vesselLength: number | undefined
    willArriveAfter: string | undefined
    willArriveBefore: string | undefined
  }>
}
