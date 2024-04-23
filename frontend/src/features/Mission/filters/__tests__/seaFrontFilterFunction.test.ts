import { SEAFRONT_GROUP_SEAFRONTS, Seafront } from '@constants/seafront'
import { Mission } from '@features/Mission/mission.types'
import { expect } from '@jest/globals'
import { getUtcizedDayjs } from '@mtes-mct/monitor-ui'

import { seafrontFilterFunction } from '../seafrontFilterFunction'

import MissionSource = Mission.MissionSource
import MissionType = Mission.MissionType

describe('domain/entities/mission/filters/seafrontFilterFunction.ts()', () => {
  it('should return true when the facade is included in the mission facade', () => {
    const mission = {
      controlUnits: [],
      envActions: [],
      facade: Seafront.MED,
      id: 123,
      isGeometryComputedFromControls: false,
      isValid: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seafrontFilterFunction(mission, [Seafront.MED])

    expect(result).toBeTruthy()
  })

  it('should return false when the facade is not included in the mission facade', () => {
    const mission = {
      controlUnits: [],
      envActions: [],
      facade: Seafront.SA,
      id: 123,
      isGeometryComputedFromControls: false,
      isValid: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seafrontFilterFunction(mission, [Seafront.MED])

    expect(result).toBeFalsy()
  })

  it('should return true when the facade is not filtered', () => {
    const mission = {
      controlUnits: [],
      envActions: [],
      facade: Seafront.SA,
      id: 123,
      isGeometryComputedFromControls: false,
      isValid: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seafrontFilterFunction(mission, [])

    expect(result).toBeTruthy()
  })

  it('should return true when a group of facade is filtered', () => {
    const mission = {
      controlUnits: [],
      envActions: [],
      facade: Seafront.GUADELOUPE,
      id: 123,
      isGeometryComputedFromControls: false,
      isValid: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const filteredGroup = SEAFRONT_GROUP_SEAFRONTS.OUTREMEROA
    const result = seafrontFilterFunction(mission, filteredGroup)

    expect(result).toBeTruthy()
  })
})
