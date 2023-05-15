import { expect } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { Mission } from '../types'
import { getMissionStatus } from '../utils'

// TODO Test all mission statuses.
describe('domain/entities/mission/utils.getMissionStatus()', () => {
  it('should return a first-letter-capitalized string', () => {
    const mission = {
      isClosed: false,
      startDateTimeUtc: customDayjs().toISOString()
    }

    const result = getMissionStatus(mission)

    expect(result).toStrictEqual(Mission.MissionStatus.IN_PROGRESS)
  })
})
