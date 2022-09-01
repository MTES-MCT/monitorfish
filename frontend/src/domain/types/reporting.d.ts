export type Reporting = {
  creationDate: string
  dimension: number
  externalReferenceNumber: string
  gear: string
  id: string
  internalReferenceNumber: string
  ircs: string
  mesh: number
  type: string
  validationDate: string
  value: InfractionSuspicion | Observation | PendingAlert
  vesselIdentifier: string
  vesselName: string
}
