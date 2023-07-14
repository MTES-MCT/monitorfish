import type { Mission } from '../../../domain/entities/mission/types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
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
  controlUnits: Array<ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft>
  isGeometryComputedFromControls: boolean
  isValid: boolean
  missionTypes?: Mission.MissionType[]
  startDateTimeUtc: string
}
