import { Mission } from '@features/Mission/mission.types'
import { getMissionStatus } from '@features/Mission/utils'
import { expect } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

// TODO Test all mission statuses.
describe('domain/entities/mission/utils.getMissionStatus()', () => {
  it('should return a first-letter-capitalized string', () => {
    const mission = {
      startDateTimeUtc: customDayjs().toISOString()
    }

    const result = getMissionStatus(mission)

    expect(result).toStrictEqual(Mission.MissionStatus.IN_PROGRESS)
  })
})
