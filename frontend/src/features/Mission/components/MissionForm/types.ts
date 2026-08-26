import type { PartialExcept } from '../../../../types'
import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'
import type { Mission } from '@features/Mission/mission.types'
import type { MissionAction } from '@features/Mission/missionAction.types'

export type MissionActionFormValues = PartialExcept<
  MissionAction.MissionActionData,
  'actionType' | 'actionDatetimeUtc'
> & {
  /**
   * Client-side identity of the draft, generated before the action has a backend `id`.
   * It lets the auto-save recognize a draft it has already created and update it instead of
   * re-creating a duplicate (see https://github.com/MTES-MCT/monitorfish/issues/5368).
   */
  draftKey?: string | undefined
  isValid: boolean
}

export type MissionActionForTimeline = MissionActionFormValues & {
  index: number
  source: Mission.MissionSource
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
