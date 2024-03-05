import { getOptionsFromLabelledEnum } from '@utils/getOptionsFromLabelledEnum'
import { Mission } from 'domain/entities/mission/types'

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)

export const MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM = [
  // We do not update this field as it is not used by the form
  'updatedAtUtc',
  // We do not update this field as it is not used by the form
  'createdAtUtc',
  // We do not update this field as it is not used by the form
  'envActions',
  'isValid'
]
