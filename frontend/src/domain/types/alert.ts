export type Alert = {
  creationDate: string
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  tripNumber: number
  type: string
  value: PendingAlert | PNOAndLANWeightToleranceAlert
  vesselIdentifier: string
  vesselName: string
}

export type PendingAlert = {
  flagState: string
  natinfCode: string | null
  seaFront: string
  speed: number
  type: string
}

export type SilencedAlert = {
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  isReactivated: boolean | null
  silencedAfterDate: Date
  silencedBeforeDate: Date
  value: PendingAlert | PNOAndLANWeightToleranceAlert
  vesselIdentifier: string
  vesselName: string
}

export type PNOAndLANWeightToleranceAlert = {
  catchesOverTolerance: PNOAndLANCatches[]
  lanOperationNumber: string
  minimumWeightThreshold: number
  name: string
  percentOfTolerance: number
  pnoOperationNumber: string
  type: string
}

export type PNOAndLANCatches = {
  lan: Object
  pno: Object
}

export type SilencedAlertPeriodRequest = {
  afterDateTime: Date | null
  beforeDateTime: Date | null
  silencedAlertPeriod: string | null
}
