// TODO Wrap into a `Reporting` namespace.

import { Seafront } from '@constants/seafront'

import { VesselIdentifier } from '../../domain/entities/vessel/types'

import type { PendingAlertValue } from '../../domain/entities/alerts/types'
import type { Infraction } from '../../domain/types/infraction'
import type { LegacyControlUnit } from '../../domain/types/legacyControlUnit'

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

type Year = number

export type ReportingAndOccurrences = {
  otherOccurrencesOfSameAlert: Reporting[]
  reporting: Reporting
}

export type CurrentAndArchivedReportingsOfSelectedVessel = {
  archived: Record<Year, ReportingAndOccurrences[]>
  current: ReportingAndOccurrences[]
}

export type InfractionSuspicion = {
  authorContact: string | undefined
  authorTrigram: string | undefined
  controlUnit: LegacyControlUnit.LegacyControlUnit | undefined
  controlUnitId: number | undefined
  description: string | undefined
  dml: string
  natinfCode: number
  reportingActor: ReportingOriginActor
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
  reportingActor: ReportingOriginActor
  title: string
  type: ReportingType.OBSERVATION
}

type ReportingTypeCharacteristic = {
  // TODO It should be useless now that types are discriminated.
  code: ReportingType
  inputName: string
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
  name: string
}

export const ReportingTypeCharacteristics: Record<ReportingType, ReportingTypeCharacteristic> = {
  ALERT: {
    code: ReportingType.ALERT,
    inputName: '',
    isInfractionSuspicion: true,
    name: 'ALERTE'
  },
  INFRACTION_SUSPICION: {
    code: ReportingType.INFRACTION_SUSPICION,
    inputName: 'Infraction (suspicion)',
    isInfractionSuspicion: true,
    name: "SUSPICION d'INFRACTION"
  },
  OBSERVATION: {
    code: ReportingType.OBSERVATION,
    inputName: 'Observation',
    isInfractionSuspicion: false,
    name: 'OBSERVATION'
  }
}

/**
 * We keep this order as it define the form option inputs order
 */
/* eslint-disable sort-keys-fix/sort-keys-fix */
export enum ReportingOriginActor {
  DIRM = 'DIRM',
  DML = 'DML',
  OPS = 'OPS',
  OTHER = 'OTHER',
  SIP = 'SIP',
  UNIT = 'UNIT'
}

export const ReportingOriginActorLabel: Record<ReportingOriginActor, string> = {
  OPS: 'OPS',
  SIP: 'SIP',
  UNIT: 'Unité',
  DML: 'DML',
  DIRM: 'DIRM',
  OTHER: 'Autre'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
