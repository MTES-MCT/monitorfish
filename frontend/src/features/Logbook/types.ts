import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { Feature } from 'ol'
import type { Coordinate } from 'ol/coordinate'
import type Point from 'ol/geom/Point'

export type VesselVoyage = {
  endDate: string | null
  isFirstVoyage: boolean
  isLastVoyage: boolean
  logbookMessagesAndAlerts: FishingActivities
  startDate: string | null
  tripNumber: number
  vesselIdentity: VesselIdentity
}

export type FishingActivities = {
  alerts: PNOAndLANWeightToleranceAlert[]
  logbookMessages: LogbookMessage[]
}

export type LogbookMessage = {
  acknowledge: {
    dateTime: string | null
    isSuccess: boolean
    rejectionCause: string | null
    returnStatus: string | null
  } | null
  deleted: boolean
  externalReferenceNumber: string
  flagState: string
  imo: string | null
  integrationDateTime: string
  internalReferenceNumber: string
  ircs: string
  isCorrected: boolean
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
  tripNumber: string
  vesselName: string
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

export type LogbookCatchesBySpecy = {
  properties: LogbookCatch[]
  species: string
  speciesName: string | null
  weight: number
}

export type LogbookCatch = {
  conversionFactor: number | null
  economicZone: string | null
  effortZone: string | null
  faoZone: string | null
  freshness: string | null
  numberFish: number | null
  packaging: string | null
  presentation: string | null
  preservationState: string | null
  species: string | null
  speciesName: string | null
  statisticalRectangle: string | null
  weight: number | null
}

export type Gear = {
  dimensions: string
  gear: string
  gearName: string
  mesh: number
}

export type PNOAndLANWeightToleranceAlertValueCatches = {
  lan: Object
  pno: Object
}

export interface FishingActivityFeature extends Feature<Point> {
  name?: string
}

export type FishingActivityFeatureIdAndCoordinates = {
  coordinates: Coordinate
  feature: FishingActivityFeature
  id: string
}

export type SpeciesInsight = {
  presentation?: string | undefined
  species: string
  speciesName: string | undefined
  totalWeight?: number | undefined
  weight: number
}

// The key is the species FAO code
export type SpeciesToSpeciesInsight = Record<string, SpeciesInsight>

// The key is the species FAO code
export type SpeciesToSpeciesInsightList = Record<string, SpeciesInsight[]>

export type CatchWithProperties = {
  properties: CatchProperty[]
  species: string
  speciesName: string | undefined
  weight: number
}

export type CatchProperty = {
  conversionFactor: string | undefined
  economicZone: number | undefined
  effortZone: number | undefined
  faoZone: string | undefined
  packaging: number | undefined
  presentation: number | undefined
  preservationState: number | undefined
  statisticalRectangle: number | undefined
  weight: number
}
