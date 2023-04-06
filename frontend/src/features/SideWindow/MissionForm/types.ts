import type { Mission } from '../../../domain/entities/mission/types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { PartialExcept } from '../../../types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export type MissionActionFormValues = PartialExcept<
  Omit<MissionAction.MissionActionData, 'missionId'>,
  'actionType' | 'actionDatetimeUtc'
>

export type MissionFormValues = Partial<
  Omit<Mission.MissionData, 'controlUnits' | 'endDateTimeUtc' | 'startDateTimeUtc' | 'missionTypes'>
> & {
  // This property is only used for the mission draft,
  // it is split as individual mission actions before being pushed to the API
  actions: MissionActionFormValues[]
  controlUnits: Array<ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft>
  dateTimeRangeUtc: DateAsStringRange | undefined
  hasOrder?: boolean | undefined
  isUnderJdp?: boolean | undefined
  missionType: Mission.MissionType
  missionTypes: Mission.MissionType[]
}
