import { DISCARD_REASON_LABEL } from '@features/Mission/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getOptionsFromLabelledEnum, type Option } from '@mtes-mct/monitor-ui'

export const FLIGHT_GOALS_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.FLIGHT_GOAL_LABEL)
export const INFRACTION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.INFRACTION_TYPE_LABEL)

export const CONTROL_CHECK_AS_OPTIONS = [
  { label: 'Oui', value: MissionAction.ControlCheck.YES },
  { label: 'Non', value: MissionAction.ControlCheck.NO },
  { label: 'N/A', value: MissionAction.ControlCheck.NOT_APPLICABLE }
] as const

export const DISCARD_REASON_AS_OPTIONS: Array<Option<string>> = Object.entries(DISCARD_REASON_LABEL).map(
  ([code, label]) => ({
    label: `${code} - ${label}`,
    value: code
  })
)

export const WEIGHT_CONTROL_METHOD_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.WEIGHT_CONTROL_METHOD_LABEL)
