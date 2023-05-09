import { expect } from '@jest/globals'
import { getUtcizedDayjs } from '@mtes-mct/monitor-ui'

import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontLabel } from '../../../../../constants'
import { Mission } from '../../types'
import { seaFrontFilterFunction } from '../seaFrontFilterFunction'

import MissionSource = Mission.MissionSource
import MissionType = Mission.MissionType

describe('domain/entities/mission/filters/seaFrontFilterFunction.ts()', () => {
  it('should return true when the facade is included in the mission facade', () => {
    const mission = {
      controlUnits: [],
      facade: SeaFrontLabel.MED,
      id: 123,
      isClosed: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seaFrontFilterFunction(mission, [SeaFrontLabel.MED])

    expect(result).toBeTruthy()
  })

  it('should return false when the facade is not included in the mission facade', () => {
    const mission = {
      controlUnits: [],
      facade: SeaFrontLabel.SA,
      id: 123,
      isClosed: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seaFrontFilterFunction(mission, [SeaFrontLabel.MED])

    expect(result).toBeFalsy()
  })

  it('should return true when the facade is not filtered', () => {
    const mission = {
      controlUnits: [],
      facade: SeaFrontLabel.SA,
      id: 123,
      isClosed: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const result = seaFrontFilterFunction(mission, [])

    expect(result).toBeTruthy()
  })

  it('should return true when a group of facade is filtered', () => {
    const mission = {
      controlUnits: [],
      facade: SeaFrontLabel.GUADELOUPE,
      id: 123,
      isClosed: false,
      missionSource: MissionSource.MONITORFISH,
      missionTypes: [MissionType.AIR],
      startDateTimeUtc: getUtcizedDayjs().toISOString()
    }

    const filteredGroup = SEA_FRONT_GROUP_SEA_FRONTS.OUTREMEROA.map(seaFront => SeaFrontLabel[seaFront])
    const result = seaFrontFilterFunction(mission, filteredGroup)

    expect(result).toBeTruthy()
  })
})
