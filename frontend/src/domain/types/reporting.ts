import type { PendingAlertValue } from './alert'

// export enum ReportingType {
//   ALERT = 'ALERT',
//   INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
//   OBSERVATION = 'OBSERVATION'
// }

export type Reporting<Value = PendingAlertValue | InfractionSuspicion | Observation> = {
  creationDate: string
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  // TODO Doesn't exists.
  // type: ReportingType
  underCharter: boolean
  validationDate: string
  // TODO Create a specific type with a discriminator prop to avoid type-guessing issues
  value: Value
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
  // TODO We ne a type here.
  // type: ReportingValueType.InfractionSuspicion
  unit: string | null
}

export type Observation = {
  authorContact: string | null
  authorTrigram: string | null
  description: string
  reportingActor: string
  title: string
  // TODO We ne a type here.
  // type: ReportingValueType.Observation
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
