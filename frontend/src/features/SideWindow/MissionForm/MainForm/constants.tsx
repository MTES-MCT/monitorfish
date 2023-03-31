// TODO Replace all options values with value-based enums.

import { Mission } from '../../../../domain/entities/mission/types'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'

export const MISSION_NATURES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionNatureLabel)

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)
