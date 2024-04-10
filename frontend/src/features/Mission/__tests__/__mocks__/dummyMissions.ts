import { Mission } from '@features/Mission/mission.types'
import { customDayjs } from '@mtes-mct/monitor-ui'

import MissionType = Mission.MissionType

export const DUMMY_MISSION_IN_PROGRESS = {
  controlUnits: [
    {
      administration: 'Douane',
      contact: undefined,
      id: 10484,
      isArchived: false,
      name: 'BGC Lorient - DF 36 Kan An Avel',
      resources: []
    }
  ],
  endDateTimeUtc: customDayjs().add(3, 'day').toISOString(),
  id: 1,
  missionTypes: [MissionType.SEA],
  startDateTimeUtc: customDayjs().toISOString()
}

export const DUMMY_MISSION_DONE = {
  controlUnits: [
    {
      administration: 'Douane',
      contact: undefined,
      id: 10484,
      isArchived: false,
      name: 'BGC Lorient - DF 36 Kan An Avel',
      resources: []
    }
  ],
  endDateTimeUtc: customDayjs().subtract(4, 'day').toISOString(),
  id: 1,
  missionTypes: [MissionType.SEA],
  startDateTimeUtc: customDayjs().subtract(7, 'day').toISOString()
}

export const DUMMY_MISSION_UPCOMING = {
  controlUnits: [
    {
      administration: 'Douane',
      contact: undefined,
      id: 10484,
      isArchived: false,
      name: 'BGC Lorient - DF 36 Kan An Avel',
      resources: []
    }
  ],
  endDateTimeUtc: customDayjs().add(7, 'day').toISOString(),
  id: 1,
  missionTypes: [MissionType.SEA],
  startDateTimeUtc: customDayjs().add(4, 'day').toISOString()
}
