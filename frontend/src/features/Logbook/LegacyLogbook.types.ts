import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { Logbook } from '@features/Logbook/Logbook.types'

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
