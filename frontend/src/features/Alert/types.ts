import { Seafront } from '@constants/seafront'

import type { MissionAction } from '@features/Mission/missionAction.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Except } from 'type-fest'

export enum PendingAlertValueType {
  BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT = 'BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT',
  FRENCH_EEZ_FISHING_ALERT = 'FRENCH_EEZ_FISHING_ALERT',
  MISSING_DEP_ALERT = 'MISSING_DEP_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  NEAFC_FISHING_ALERT = 'NEAFC_FISHING_ALERT',
  RTC_FISHING_ALERT = 'RTC_FISHING_ALERT',
  SUSPICION_OF_UNDER_DECLARATION_ALERT = 'SUSPICION_OF_UNDER_DECLARATION_ALERT',
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
  vesselIdentifier: Vessel.VesselIdentifier
  vesselName: string
}

export type PendingAlertValue = {
  dml?: string | null
  natinfCode?: number | null
  riskFactor?: number
  seaFront?: Seafront | null
  speed?: number
  type: PendingAlertValueType
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type LEGACY_PendingAlert = PendingAlert & {
  isValidated: boolean
}

export type SilencedAlert = {
  externalReferenceNumber: string | undefined
  flagState: string
  id: string
  internalReferenceNumber: string | undefined
  ircs: string | undefined
  isReactivated: boolean | undefined
  silencedBeforeDate: string
  value: PendingAlertValue
  vesselId: number | undefined
  vesselIdentifier: Vessel.VesselIdentifier
  vesselName: string
}

export type SilencedAlertData = Except<SilencedAlert, 'id' | 'isReactivated'>

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

export type AlertNameAndVesselIdentity = Vessel.VesselIdentity & {
  name: string | null | undefined
}
