import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

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

// TODO Replace with `LogbookMessage.LogbookMessage`.
// Can be done after using RTK in `getVesselLogbookFromAPI()` since undefined !== null.
export type LogbookMessage = {
  acknowledge: {
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
  isConsolidated: boolean
  isCorrected: boolean
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

// TODO Replace this type with `LogbookMessage.Catch`.
// Can be done after using RTK in `getVesselLogbookFromAPI()` since undefined !== null.
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
  species: string
  speciesName: string | null
  statisticalRectangle: string | null
  weight: number | null
}

// TODO Replace this type with `LogbookMessage.Gear`.
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

export type COEMessageValue = {
  economicZoneEntered: string
  effortZoneEntryDatetimeUtc: string
  faoZoneEntered: string
  latitudeEntered: number
  longitudeEntered: number
  statisticalRectangleEntered: string
  targetSpeciesNameOnEntry: string
  targetSpeciesOnEntry: string
}

export type COXMessageValue = {
  economicZoneExited: string
  effortZoneExitDatetimeUtc: string
  faoZoneExited: string
  latitudeExited: number
  longitudeExited: number
  statisticalRectangleExited: string
  targetSpeciesNameOnExit: string
  targetSpeciesOnExit: string
}

export type CROMessageValue = {
  effortZoneEntryDatetimeUtc: string
  effortZoneExitDatetimeUtc: string
  latitudeEntered: number
  latitudeExited: number
  longitudeEntered: number
  longitudeExited: number
}

export type DISMessageValue = {
  catches: LogbookCatch[]
  discardDatetimeUtc: string
  latitude: number
  longitude: number
}

export type EOFMessageValue = {
  endOfFishingDatetimeUtc: string
}

export type DEPMessageValue = {
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

export type PNOMessageValue = {
  catchOnboard: LogbookCatch[]
  port: string
  portName: string
  predictedArrivalDatetimeUtc: string
  predictedLandingDatetimeUtc: string
  purpose: PriorNotification.PurposeCode
  tripStartDate: string
}

export type RTPMessageValue = {
  gearOnboard: Gear[]
  port: string
  portName: string
  reasonOfReturn: string
  returnDatetimeUtc: string
}

export type CPSMessageValue = {
  catches: ProtectedSpeciesCatch[]
  cpsDatetimeUtc?: string
  dimensions?: string
  gear?: string
  gearName?: string
  latitude?: number
  longitude?: number
  mesh?: number
}

export type LANMessageValue = {
  catchLanded: LogbookCatch[]
  landingDatetimeUtc: string
  port: string
  portName?: string
  sender?: string
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
