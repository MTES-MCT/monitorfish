import { getOptionsFromLabelledEnum } from '@utils/getOptionsFromLabelledEnum'
import { MissionAction } from 'domain/types/missionAction'

export const FLIGHT_GOALS_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.FLIGHT_GOAL_LABEL)
export const INFRACTION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.INFRACTION_TYPE_LABEL)