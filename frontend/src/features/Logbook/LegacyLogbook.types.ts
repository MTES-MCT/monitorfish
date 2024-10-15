import type { Logbook } from '@features/Logbook/Logbook.types'

/** @deprecated Replace with `Logbook.Message` . */
// Can be done after using RTK in `getVesselLogbookFromAPI()` since undefined !== null.
export type LogbookMessage = {
  acknowledgment: {
    dateTime: string | null
    isSuccess: boolean
    rejectionCause: string | null
    returnStatus: string | null
  } | null
  externalReferenceNumber: string
  flagState: string
  imo: string | null
  integrationDateTime: string
  internalReferenceNumber: string
  ircs: string
  isCorrectedByNewerMessage: boolean
  isDeleted: boolean
  isSentByFailoverSoftware: boolean
  message: any
  messageType: string
  operationDateTime: string
  operationNumber: string
  operationType: string
  rawMessage: string
  referencedReportId: string | null
  reportDateTime: string
  reportId: string
  tripGears: Gear[] | undefined
  tripNumber: string
  tripSegments: Logbook.Segment[] | undefined
  vesselName: string
}

/** @deprecated Replace with `Logbook.Catch`. */
// Can be done after using RTK in `getVesselLogbookFromAPI()` since undefined !== null.
export type LogbookCatch = {
  conversionFactor: number | null
  economicZone: string | null
  effortZone: string | null
  faoZone: string | null
  freshness: string | null
  nbFish: number | null
  packaging: string | null
  presentation: string | null
  preservationState: string | null
  species: string
  speciesName: string | null
  statisticalRectangle: string | null
  weight: number | null
}

/** @deprecated Replace with `Logbook.Gear`. */
// Can be done after using RTK in `getVesselLogbookFromAPI()` since undefined !== null.
export type Gear = {
  dimensions: string | null
  /** Gear code. */
  gear: string | null
  gearName: string | null
  mesh: number | null
}
