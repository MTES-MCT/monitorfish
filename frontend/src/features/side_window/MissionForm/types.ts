import type { Mission, MissionUnit } from '../../../domain/types/mission'
import type { DateRange } from '@mtes-mct/monitor-ui/types'

export type FormValues = Partial<Omit<Mission, 'endDate' | 'startDate' | 'units'>> & {
  dateRange?: DateRange
  units: Partial<MissionUnit>[]
}
