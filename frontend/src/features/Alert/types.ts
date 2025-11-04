import {
  AdministrativeAreaSpecificationSchema,
  AlertSpecificationSchema,
  GearSpecificationSchema,
  RegulatoryAreaSpecificationSchema,
  SpeciesSpecificationSchema
} from '@features/Alert/schemas/AlertSpecificationSchema'
import { PendingAlertValueSchema, SilencedAlertSchema } from '@features/Alert/schemas/SilencedAlertSchema'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import z from 'zod'

import type { EditedAlertSpecificationSchema } from '@features/Alert/schemas/EditedAlertSpecificationSchema'
import type { MissionAction } from '@features/Mission/missionAction.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Except } from 'type-fest'

export type PendingAlert = {
  creationDate: string
  externalReferenceNumber: string
  flagState: string
  id: number
  infraction: MissionAction.Infraction | null
  internalReferenceNumber: string
  ircs: string
  tripNumber: string
  value: PendingAlertValue
  vesselIdentifier: VesselIdentifier
  vesselName: string
}

export type PendingAlertValue = z.infer<typeof PendingAlertValueSchema>

// eslint-disable-next-line @typescript-eslint/naming-convention
export type LEGACY_PendingAlert = PendingAlert & {
  isValidated: boolean
}

export type SilencedAlert = z.infer<typeof SilencedAlertSchema>

export type SilencedAlertData = Except<SilencedAlert, 'id' | 'isReactivated'>

export type SilencedAlertPeriodRequest = {
  beforeDateTime: Date | null
  silencedAlertPeriod: string | null
}

export type SilenceAlertQueueItem = {
  pendingAlertId: number
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
}

export type AlertNameAndVesselIdentity = Vessel.VesselIdentity & {
  name: string | null | undefined
}

export type AlertSpecification = z.infer<typeof AlertSpecificationSchema>
export type GearSpecification = z.infer<typeof GearSpecificationSchema>
export type SpeciesSpecification = z.infer<typeof SpeciesSpecificationSchema>
export type RegulatoryAreaSpecification = z.infer<typeof RegulatoryAreaSpecificationSchema>
export type AdministrativeAreaSpecification = z.infer<typeof AdministrativeAreaSpecificationSchema>

export type EditedAlertSpecification = z.infer<typeof EditedAlertSpecificationSchema>

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum GearMeshSizeEqualityComparator {
  BETWEEN = 'BETWEEN',
  EQUAL = 'EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO',
  LOWER_THAN = 'LOWER_THAN',
  LOWER_THAN_OR_EQUAL_TO = 'LOWER_THAN_OR_EQUAL_TO'
}

export const gearMeshSizeEqualityComparatorLabels: Record<GearMeshSizeEqualityComparator, string> = {
  [GearMeshSizeEqualityComparator.BETWEEN]: 'entre',
  [GearMeshSizeEqualityComparator.EQUAL]: 'égal à',
  [GearMeshSizeEqualityComparator.GREATER_THAN]: 'supérieur à',
  [GearMeshSizeEqualityComparator.GREATER_THAN_OR_EQUAL_TO]: 'supérieur ou égal à',
  [GearMeshSizeEqualityComparator.LOWER_THAN]: 'inférieur à',
  [GearMeshSizeEqualityComparator.LOWER_THAN_OR_EQUAL_TO]: 'inférieur ou égal à'
}
export const gearMeshSizeOptions = [
  {
    label: 'supérieur à',
    value: GearMeshSizeEqualityComparator.GREATER_THAN
  },
  {
    label: 'supérieur ou égal à',
    value: GearMeshSizeEqualityComparator.GREATER_THAN_OR_EQUAL_TO
  },
  {
    label: 'inférieur à',
    value: GearMeshSizeEqualityComparator.LOWER_THAN
  },
  {
    label: 'inférieur ou égal à',
    value: GearMeshSizeEqualityComparator.LOWER_THAN_OR_EQUAL_TO
  },
  {
    label: 'égal à',
    value: GearMeshSizeEqualityComparator.EQUAL
  },
  {
    label: 'entre',
    value: GearMeshSizeEqualityComparator.BETWEEN
  }
]
