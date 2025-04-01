import { Vessel } from '@features/Vessel/Vessel.types'
import { describe, expect, it } from '@jest/globals'

import { MonitorFishWebWorker } from '../MonitorFishWebWorker'
import { DUMMY_LAST_POSITIONS } from './__mocks__/dummyLastPositions'

const mockVessels = [
  {
    ...DUMMY_LAST_POSITIONS[0],
    vesselGroups: [
      { color: '#12ad2b', id: 1, name: 'Vessel Group 1' },
      { color: '#12ad2b', id: 2, name: 'Vessel Group 2' },
      { color: '#af2c4b', id: 3, name: 'Vessel Group 3' }
    ]
  } as Vessel.VesselLastPosition,
  {
    ...DUMMY_LAST_POSITIONS[1],
    vesselGroups: [{ color: '#12ad2b', id: 2, name: 'Vessel Group 2' }]
  } as Vessel.VesselLastPosition
]

describe('MonitorFishWebWorker.getDisplayedVesselsGroups', () => {
  it('should return the correct group information when all groups are displayed and no group pinned', () => {
    const result = MonitorFishWebWorker.getDisplayedVesselsGroups(mockVessels, [3, 2, 1], [])
    expect(result).toEqual([
      {
        groupColor: [175, 44, 75, 1],
        groupsDisplayed: [
          { color: '#af2c4b', id: 3, name: 'Vessel Group 3' },
          { color: '#12ad2b', id: 2, name: 'Vessel Group 2' },
          { color: '#12ad2b', id: 1, name: 'Vessel Group 1' }
        ],
        numberOfGroupsHidden: 0
      },
      {
        groupColor: [18, 173, 43, 1],
        groupsDisplayed: [{ color: '#12ad2b', id: 2, name: 'Vessel Group 2' }],
        numberOfGroupsHidden: 0
      }
    ])
  })

  it('should return the correct group information when all groups are displayed and two groups pinned', () => {
    const result = MonitorFishWebWorker.getDisplayedVesselsGroups(mockVessels, [3, 2, 1], [3, 1])

    expect(result).toEqual([
      {
        groupColor: [175, 44, 75, 1],
        groupsDisplayed: [
          { color: '#af2c4b', id: 3, name: 'Vessel Group 3' },
          { color: '#12ad2b', id: 1, name: 'Vessel Group 1' },
          { color: '#12ad2b', id: 2, name: 'Vessel Group 2' }
        ],
        numberOfGroupsHidden: 0
      },
      {
        groupColor: [18, 173, 43, 1],
        groupsDisplayed: [{ color: '#12ad2b', id: 2, name: 'Vessel Group 2' }],
        numberOfGroupsHidden: 0
      }
    ])
  })

  it('should return correct numberOfGroupsHidden when no groups are displayed', () => {
    const result = MonitorFishWebWorker.getDisplayedVesselsGroups(mockVessels, [], [])

    expect(result).toEqual([
      {
        groupColor: [0, 0, 0],
        groupsDisplayed: [],
        numberOfGroupsHidden: 3
      },
      {
        groupColor: [0, 0, 0],
        groupsDisplayed: [],
        numberOfGroupsHidden: 1
      }
    ])
  })
})
