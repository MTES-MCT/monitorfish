import { Mission } from '@features/Mission/mission.types'
import { getOptionsFromLabelledEnum } from '@utils/getOptionsFromLabelledEnum'

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)
