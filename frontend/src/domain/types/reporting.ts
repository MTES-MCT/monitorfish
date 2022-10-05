import type { SeaFront } from '../entities/alerts/constants'
import type { PendingAlertValue } from './alert'

export enum ReportingType {
  // TODO Should be renamed 'PENDING_ALERT'.
  ALERT = 'ALERT',
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  OBSERVATION = 'OBSERVATION'
}

export type BaseReporting = {
  creationDate: string
  externalReferenceNumber: string
  id: string
  internalReferenceNumber: string
  ircs: string
  underCharter: boolean
  validationDate: string
  vesselIdentifier: string
  vesselName: string

  // TODO These 2 props shouldn't be there at all and should be treated in a separated redux state.
  // eslint-disable-next-line typescript-sort-keys/interface
  dml?: string
  validationDateTimestamp?: number
}

export type InfractionSuspicionReporting = BaseReporting & {
  type: ReportingType.INFRACTION_SUSPICION
  value: InfractionSuspicion
}

export type ObservationReporting = BaseReporting & {
  type: ReportingType.OBSERVATION
  value: Observation
}

export type PendingAlertReporting = BaseReporting & {
  type: ReportingType.ALERT
  value: PendingAlertValue
}

export type Reporting = InfractionSuspicionReporting | ObservationReporting | PendingAlertReporting

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
  seaFront: SeaFront
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
