import type { ControlUnit } from '../../../../domain/types/controlUnit'
import type { MissionType, MissionData } from '../../../../domain/types/mission'
import type { Undefine } from '../../../../types'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export type MissionFormValues = Partial<
  Omit<
    MissionData,
    'controlUnits' | 'inputStartDateTimeUtc' | 'inputEndDateTimeUtc' | 'missionSource' | 'missionType' | 'controlUnits'
  >
> & {
  controlUnits: Undefine<ControlUnit>[]
  hasOrder?: boolean | undefined
  inputDateTimeRangeUtc: DateAsStringRange | undefined
  missionType: MissionType
  zones: string[]
}
