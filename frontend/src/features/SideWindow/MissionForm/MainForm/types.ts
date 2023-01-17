import type { MissionType, Mission, ControlUnit } from '../../../../domain/types/mission'
import type { DateRange } from '@mtes-mct/monitor-ui'

export type FormValues = Partial<Omit<Mission, 'endDate' | 'startDate' | 'units'>> & {
  dateRange?: DateRange
  type: MissionType
  units: Partial<ControlUnit>[]
}
