import type { PartialExcept } from '../../../../types'
import type { Mission } from 'domain/entities/mission/types'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'
import type { MissionAction } from 'domain/types/missionAction'

export type MissionActionFormValues = PartialExcept<
  MissionAction.MissionActionData,
  'actionType' | 'actionDatetimeUtc'
> & {
  isValid: boolean
}

export type MissionMainFormValues = Partial<
  Omit<Mission.MissionData, 'actions' | 'controlUnits' | 'startDateTimeUtc' | 'missionTypes'>
> & {
  controlUnits: Array<LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft>
  id: number | undefined
  isGeometryComputedFromControls: boolean
  isValid: boolean
  missionTypes?: Mission.MissionType[]
  startDateTimeUtc: string
}
