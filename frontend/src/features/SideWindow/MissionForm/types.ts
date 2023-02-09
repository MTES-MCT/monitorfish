import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { Mission } from '../../../domain/types/mission'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { PartialExcept, Undefine } from '../../../types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export type MissionActionFormValues = PartialExcept<
  MissionAction.MissionActionData,
  'actionType' | 'actionDatetimeUtc'
> & {
  // If it's a draft, that means the user just added this new action (and we'll show "à renseigner" in the list)
  isDraft: boolean
}

export type MissionFormValues = Partial<
  Omit<
    Mission.MissionData,
    'controlUnits' | 'endDateTimeUtc' | 'startDateTimeUtc' | 'missionSource' | 'missionType' | 'controlUnits'
  >
> & {
  // This property is only used for the mission draft,
  // it is split as individual mission actions before being pushed to the API
  actions: MissionActionFormValues[]
  controlUnits: Undefine<ControlUnit>[]
  dateTimeRangeUtc: DateAsStringRange | undefined
  hasOrder?: boolean | undefined
  isUnderJdp?: boolean | undefined
  missionType: Mission.MissionType
}
