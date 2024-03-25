import { getMissionDataFromMissionFormValues } from '@features/Mission/components/MissionForm/utils'
import { expect } from '@jest/globals'

import { Mission } from '../../Mission/mission.types'

import MissionSource = Mission.MissionSource
import MissionType = Mission.MissionType

describe('utils/getMissionDataFromMissionFormValues()', () => {
  it('should keep the existing missionSource if previously set', () => {
    const missionForm = {
      controlUnits: [
        {
          administration: 'DDTM',
          contact: undefined,
          id: 10499,
          isArchived: false,
          name: 'Cultures marines 56',
          resources: [
            {
              id: 314,
              name: 'Brezel - FAH 7185'
            }
          ]
        }
      ],
      endDateTimeUtc: '2023-12-31T23:30:00.000000Z',
      id: undefined,
      isClosed: false,
      isGeometryComputedFromControls: true,
      isUnderJdp: true,
      isValid: true,
      missionSource: MissionSource.POSEIDON_CNSP,
      missionTypes: [MissionType.SEA],
      startDateTimeUtc: '2022-12-31T23:30:00.000000Z'
    }

    const result = getMissionDataFromMissionFormValues(missionForm)

    expect(result).toStrictEqual({
      controlUnits: [
        {
          administration: 'DDTM',
          contact: undefined,
          id: 10499,
          isArchived: false,
          name: 'Cultures marines 56',
          resources: [
            {
              id: 314,
              name: 'Brezel - FAH 7185'
            }
          ]
        }
      ],
      endDateTimeUtc: '2023-12-31T23:30:00.000000Z',
      id: undefined,
      isClosed: false,
      isGeometryComputedFromControls: true,
      isUnderJdp: true,
      missionSource: 'POSEIDON_CNSP',
      missionTypes: ['SEA'],
      startDateTimeUtc: '2022-12-31T23:30:00.000000Z'
    })
  })
})
