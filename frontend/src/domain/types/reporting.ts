import type { AlertValueForPending } from './alert'

export type Reporting = {
  creationDate: string
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  // TODO Doesn't exists.
  type: any
  // type: ReportingType<string>
  validationDate: string
  // TODO Create a specific type with a discriminator prop to avoid type-guessing issues
  value: AlertValueForPending | InfractionSuspicion | Observation
  vesselIdentifier: string
  vesselName: string
}

export type CurrentAndArchivedReportingsOfSelectedVessel = {
  archived: Reporting[]
  current: Reporting[]
}

export type InfractionSuspicion = {
  authorContact: string | null
  authorTrigram: string | null
  description: string
  dml: string
  natinfCode: string
  reportingActor: string
  title: string
  unit: string | null
}

export type Observation = {
  authorContact: string | null
  authorTrigram: string | null
  description: string
  reportingActor: string
  title: string
  unit: string | null
}

export type UpdateReporting = {
  authorContact: string | undefined
  authorTrigram: string | undefined
  description: string | undefined
  dml: string | undefined
  natinfCode: string | undefined
  reportingActor: string
  title: string
  unit: string | undefined
}
