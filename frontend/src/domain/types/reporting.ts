import { Seafront } from '@constants/seafront'
import { ReportingOriginActor } from '@features/Reporting/types'

import type { Infraction } from './infraction'
import type { LegacyControlUnit } from './legacyControlUnit'
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
  infraction: Infraction | null
  internalReferenceNumber: string | null
  ircs: string | null
  isArchived: boolean
  isDeleted: boolean
  type: ReportingType.ALERT | ReportingType.OBSERVATION | ReportingType.INFRACTION_SUSPICION
  underCharter: boolean | null
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

export type BaseReportingCreation = Omit<
  BaseReporting,
  'id' | 'infraction' | 'underCharter' | 'isArchived' | 'isDeleted'
>

export type ReportingCreation = BaseReportingCreation & {
  type: ReportingType.INFRACTION_SUSPICION | ReportingType.OBSERVATION
  value: EditedReporting
}

export type Reporting = InfractionSuspicionReporting | ObservationReporting | PendingAlertReporting

export type EditableReporting = InfractionSuspicionReporting | ObservationReporting

export type EditedReporting = Partial<InfractionSuspicion | Observation> & {
  type: ReportingType.INFRACTION_SUSPICION | ReportingType.OBSERVATION
}

export type CurrentAndArchivedReportingsOfSelectedVessel = {
  archived: Reporting[]
  current: Reporting[]
}

export type InfractionSuspicion = {
  authorContact: string | undefined
  authorTrigram: string | undefined
  controlUnit: LegacyControlUnit.LegacyControlUnit | undefined
  controlUnitId: number | undefined
  description: string | undefined
  dml: string
  natinfCode: number
  reportingActor: keyof typeof ReportingOriginActor
  seaFront: Seafront
  title: string
  type: ReportingType.INFRACTION_SUSPICION
}

export type Observation = {
  authorContact: string | undefined
  authorTrigram: string | undefined
  controlUnit: LegacyControlUnit.LegacyControlUnit | undefined
  controlUnitId: number | undefined
  description: string | undefined
  reportingActor: keyof typeof ReportingOriginActor
  title: string
  type: ReportingType.OBSERVATION
}
