import type { PartialExcept } from '../../../../types'
import type { Mission } from '@features/Mission/mission.types'
import type { MissionAction } from '@features/Mission/missionAction.types'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'

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
