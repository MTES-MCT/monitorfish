import type { MissionAction } from '../../types/missionAction'
import type { VesselIdentifier, VesselIdentity } from '../vessel/types'

export enum PendingAlertValueType {
  FRENCH_EEZ_FISHING_ALERT = 'FRENCH_EEZ_FISHING_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  THREE_MILES_TRAWLING_ALERT = 'THREE_MILES_TRAWLING_ALERT',
  TWELVE_MILES_FISHING_ALERT = 'TWELVE_MILES_FISHING_ALERT'
}

export type PendingAlert = {
  creationDate: string
  externalReferenceNumber: string
  flagState: string
  id: string
  infraction: MissionAction.Infraction | null
  internalReferenceNumber: string
  ircs: string
  tripNumber: string
  value: PendingAlertValue
  vesselIdentifier: VesselIdentifier
  vesselName: string
}

export type PendingAlertValue = {
  dml: string
  natinfCode: string | null
  riskFactor: number
  seaFront: string
  speed: number
  type: PendingAlertValueType
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type LEGACY_PendingAlert = PendingAlert & {
  isValidated: boolean
}

export type SilencedAlert = {
  externalReferenceNumber: string
  flagState: string
  id: string
  internalReferenceNumber: string
  ircs: string
  isReactivated: boolean | null
  silencedBeforeDate: Date
  value: PendingAlertValue
  vesselIdentifier: VesselIdentifier
  vesselName: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type LEGACY_SilencedAlert = SilencedAlert & {
  silencedPeriod?: SilencedAlertPeriodRequest
}

export type SilencedAlertPeriodRequest = {
  beforeDateTime: Date | null
  silencedAlertPeriod: string | null
}

export type SilenceAlertQueueItem = {
  pendingAlertId: string
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
}

export type AlertNameAndVesselIdentity = VesselIdentity & {
  name: string | null
}
