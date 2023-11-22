import type { Mission } from '../../../domain/entities/mission/types'
import type { LegacyControlUnit } from '../../../domain/types/legacyControlUnit'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { PartialExcept } from '../../../types'

export type MissionActionFormValues = PartialExcept<
  Omit<MissionAction.MissionActionData, 'missionId'>,
  'actionType' | 'actionDatetimeUtc'
> & {
  isValid: boolean
}

export type MissionMainFormValues = Partial<
  Omit<Mission.MissionData, 'actions' | 'controlUnits' | 'startDateTimeUtc' | 'missionTypes'>
> & {
  controlUnits: Array<LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft>
  isGeometryComputedFromControls: boolean
  isValid: boolean
  missionTypes?: Mission.MissionType[]
  startDateTimeUtc: string
}
