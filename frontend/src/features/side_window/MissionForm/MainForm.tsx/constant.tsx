import type { MissionUnit } from '../../../../domain/types/mission'
import type { FormValues } from '../types'

export const EMPTY_UNIT: Partial<MissionUnit> = {
  administrationId: undefined,
  contactId: undefined,
  meanId: undefined,
  unitId: undefined
}

export const INITIAL_VALUES: FormValues = {
  units: [EMPTY_UNIT]
}
