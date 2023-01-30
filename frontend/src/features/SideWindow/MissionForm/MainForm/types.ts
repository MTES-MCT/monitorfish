import type { ControlUnit } from '../../../../domain/types/controlUnit'
import type { MissionType, MissionData } from '../../../../domain/types/mission'
import type { Undefine } from '../../../../types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export type MissionFormValues = Partial<
  Omit<
    MissionData,
    'controlUnits' | 'endDateTimeUtc' | 'startDateTimeUtc' | 'missionSource' | 'missionType' | 'controlUnits'
  >
> & {
  controlUnits: Undefine<ControlUnit>[]
  dateTimeRangeUtc: DateAsStringRange | undefined
  hasOrder?: boolean | undefined
  isUnderJdp?: boolean | undefined
  missionType: MissionType
}
