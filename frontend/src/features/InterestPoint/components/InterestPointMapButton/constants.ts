import { InterestPointType } from '../../utils'

import type { Option } from '@mtes-mct/monitor-ui'

export const INTEREST_POINTS_OPTIONS: Array<Option<InterestPointType>> = [
  {
    label: 'Moyen de contrôle',
    value: InterestPointType.CONTROL_ENTITY
  },
  {
    label: 'Navire de pêche',
    value: InterestPointType.FISHING_VESSEL
  },
  {
    label: 'Engin de pêche',
    value: InterestPointType.FISHING_GEAR
  },
  {
    label: 'Autre point',
    value: InterestPointType.OTHER
  }
]
