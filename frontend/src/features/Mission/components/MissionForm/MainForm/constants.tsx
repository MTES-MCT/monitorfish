import { Mission } from '@features/Mission/mission.types'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)
