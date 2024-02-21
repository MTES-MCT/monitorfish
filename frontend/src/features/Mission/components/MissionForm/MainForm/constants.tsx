import { getOptionsFromLabelledEnum } from '@utils/getOptionsFromLabelledEnum'
import { Mission } from 'domain/entities/mission/types'

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)
