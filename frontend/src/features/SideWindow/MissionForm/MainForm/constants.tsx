// TODO Replace all options values with value-based enums.

import { Mission } from '../../../../domain/types/mission'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'

import type { Option } from '@mtes-mct/monitor-ui'

export const FLIGHT_GOALS_AS_OPTIONS: Option[] = [
  { label: 'Vérifications VMS/AIS', value: 'Vérifications VMS/AIS' },
  { label: 'Pêche sans autorisation', value: 'Pêche sans autorisation' },
  { label: 'Zones fermées', value: 'Zones fermées' }
]

export const MISSION_NATURES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionNatureLabel)

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(Mission.MissionTypeLabel)

export const TARGETTED_SEGMENTS_AS_OPTIONS: Option[] = [
  // { label: '', value: '' }
]
