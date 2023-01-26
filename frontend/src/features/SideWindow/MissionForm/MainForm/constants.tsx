// TODO Replace all options values with value-based enums.

import { MissionNatureLabel, MissionTypeLabel } from '../../../../domain/types/mission'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'

import type { MissionFormValues } from './types'
import type { Option } from '@mtes-mct/monitor-ui'

export const INITIAL_MISSION_CONTROL_UNIT: MissionFormValues['controlUnits'][0] = {
  administration: undefined,
  contact: undefined,
  id: undefined,
  name: undefined,
  resources: undefined
}

export const FLIGHT_GOALS_AS_OPTIONS: Option[] = [
  { label: 'Vérifications VMS/AIS', value: 'Vérifications VMS/AIS' },
  { label: 'Pêche sans autorisation', value: 'Pêche sans autorisation' },
  { label: 'Zones fermées', value: 'Zones fermées' }
]

export const MISSION_NATURES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionNatureLabel)

export const MISSION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionTypeLabel)

export const TARGETTED_SEGMENTS_AS_OPTIONS: Option[] = [
  // { label: '', value: '' }
]
