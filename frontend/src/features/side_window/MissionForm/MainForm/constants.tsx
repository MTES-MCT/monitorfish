// TODO Replace all options values with value-based enums.

import { MissionType, MissionUnit } from '../../../../domain/types/mission'

import type { FormValues } from './types'
import type { Option } from '@mtes-mct/monitor-ui'

export const EMPTY_UNIT: Partial<MissionUnit> = {
  administration: undefined,
  contact: undefined,
  resources: [],
  unit: undefined
}

export const INITIAL_VALUES: FormValues = {
  dateRange: [new Date(), new Date(Date.now() + 3_600_000)],
  type: MissionType.SEA,
  units: [EMPTY_UNIT],
  zones: []
}

export const FLIGHT_GOALS_AS_OPTIONS: Option[] = [
  { label: 'Vérifications VMS/AIS', value: 'Vérifications VMS/AIS' },
  { label: 'Pêche sans autorisation', value: 'Pêche sans autorisation' },
  { label: 'Zones fermées', value: 'Zones fermées' }
]

export const TARGETTED_SEGMENTS_AS_OPTIONS: Option[] = [
  // { label: '', value: '' }
]
