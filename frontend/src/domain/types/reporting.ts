import { SeaFrontGroup } from '../entities/seaFront/constants'

import type { ControlUnit } from './controlUnit'
import type { MissionAction } from './missionAction'
import type { PendingAlertValue } from '../entities/alerts/types'
import type { VesselIdentifier } from '../entities/vessel/types'

export enum ReportingType {
  // TODO Should be renamed 'PENDING_ALERT'.
  ALERT = 'ALERT',
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  OBSERVATION = 'OBSERVATION'
}

export type BaseReporting = {
  creationDate: string
  externalReferenceNumber: string | null
  flagState: string
  id: number
  infraction: MissionAction.Infraction | null
  internalReferenceNumber: string | null
  ircs: string | null
  type: ReportingType
  underCharter: boolean
  validationDate: string | null
  vesselId: number | null
  vesselIdentifier: VesselIdentifier | null
  vesselName: string | null

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

export type BaseReportingCreation = Omit<BaseReporting, 'id' | 'infraction' | 'underCharter'>

export type ReportingCreation = BaseReportingCreation & {
  type: ReportingType.INFRACTION_SUSPICION | ReportingType.OBSERVATION
  value: InfractionSuspicion | Observation
}

export type Reporting = InfractionSuspicionReporting | ObservationReporting | PendingAlertReporting

export type CurrentAndArchivedReportingsOfSelectedVessel = {
  archived: Reporting[]
  current: Reporting[]
}

export type InfractionSuspicion = {
  authorContact: string | null
  authorTrigram: string | null
  controlUnit: ControlUnit.ControlUnit | null
  controlUnitId: number | null
  description: string
  dml: string
  natinfCode: number
  reportingActor: string
  seaFront: SeaFrontGroup
  title: string
  type: string
}

export type Observation = {
  authorContact: string | null
  authorTrigram: string | null
  controlUnit: ControlUnit.ControlUnit | null
  controlUnitId: number | null
  description: string
  reportingActor: string
  title: string
  type: string
}

export type ReportingUpdate = {
  authorContact: string | undefined
  authorTrigram: string | undefined
  controlUnitId: number | null
  description: string | undefined
  natinfCode: number | null
  reportingActor: string
  title: string
  type: ReportingType
}
