// TODO Find a way to associate `Alert`, `PendingAlert` and `SilencedAlert` via data/extra props.

export enum AlertType {
  'ACTIVE' = 'ACTIVE',
  'SILENCED' = 'SILENCED'
}

export type LEGACY_Alert = {
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  value: AlertValueForPending | AlertValueForPNOAndLANWeightTolerance
  vesselIdentifier: string
  vesselName: string
}

export type LEGACY_ActiveAlert = LEGACY_Alert & {
  creationDate: string
  infraction: {
    infraction: string
    infractionCategory: string
    natinfCode: string
    regulation: string
  }
  tripNumber: string
}

export type ActiveAlert = LEGACY_ActiveAlert & {
  isValidated: boolean
  type: AlertType.ACTIVE
}

export type LEGACY_SilencedAlert = LEGACY_Alert & {
  isReactivated: boolean | null
  silencedAfterDate: Date
  silencedBeforeDate: Date
}

export type SilencedAlert = LEGACY_SilencedAlert & {
  silencedPeriod?: SilencedAlertPeriodRequest
  type: AlertType.SILENCED
}

export type AlertValueForPending = {
  flagState: string
  natinfCode: string | null
  seaFront: string
  speed: number
  type: '' // ???
}

export type AlertValueForPNOAndLANWeightTolerance = {
  catchesOverTolerance: PNOAndLANWeightToleranceCatches[]
  lanOperationNumber: string
  minimumWeightThreshold: number
  name: string
  percentOfTolerance: number
  pnoOperationNumber: string
  type: 'THREE_MILES_TRAWLING_ALERT' | 'FRENCH_EEZ_FISHING_ALERT' | 'TWELVE_MILES_FISHING_ALERT' | 'MISSING_FAR_ALERT'
}

export type PNOAndLANWeightToleranceCatches = {
  lan: Object
  pno: Object
}

export type SilencedAlertPeriodRequest = {
  afterDateTime: Date | null
  beforeDateTime: Date | null
  silencedAlertPeriod: string | null
}
