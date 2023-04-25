import type { Mission } from '../../../domain/entities/mission/types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { PartialExcept } from '../../../types'

export type MissionActionFormValues = PartialExcept<
  Omit<MissionAction.MissionActionData, 'missionId'>,
  'actionType' | 'actionDatetimeUtc'
> & {
  isVesselUnknown?: boolean | undefined
}

export type MissionFormValues = Partial<
  Omit<Mission.MissionData, 'actions' | 'controlUnits' | 'startDateTimeUtc' | 'missionTypes'>
> & {
  // This property is only used for the mission draft,
  // it is split as individual mission actions before being pushed to the API
  actions: MissionActionFormValues[]
  controlUnits: Array<ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft>
  hasOrder?: boolean | undefined
  isUnderJdp?: boolean | undefined
  missionTypes?: Mission.MissionType[]
  startDateTimeUtc: string
}
