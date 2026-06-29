import {
  GroupType,
  type HardcodedPriorityVesselGroup,
  Sharing,
  type VesselGroup,
  type VesselGroupWithVessels
} from '@features/VesselGroup/types'
import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { MonitorFishWebWorker } from '../MonitorFishWebWorker'

const createGroup = (overrides: Partial<VesselGroup> & { id: number }): VesselGroupWithVessels =>
  ({
    group: {
      color: '#12ad2b',
      createdAtUtc: '2024-01-01T00:00:00Z',
      createdBy: 'test-user',
      description: undefined,
      endOfValidityUtc: undefined,
      isDeleted: false,
      isPriorityGroup: false,
      name: `Vessel Group ${overrides.id}`,
      pointsOfAttention: undefined,
      sharedTo: undefined,
      sharing: Sharing.PRIVATE,
      startOfValidityUtc: undefined,
      type: GroupType.FIXED,
      updatedAtUtc: undefined,
      vessels: [],
      ...overrides
    },
    vessels: []
  }) as VesselGroupWithVessels

const createPriorityGroup = (
  overrides: Partial<HardcodedPriorityVesselGroup> & { id: number; name: string }
): VesselGroupWithVessels => ({
  group: {
    color: '#E1000F',
    createdAtUtc: '2024-01-01T00:00:00Z',
    createdBy: '',
    description: undefined,
    endOfValidityUtc: undefined,
    isDeleted: false,
    isPriorityGroup: true,
    pointsOfAttention: undefined,
    priorityLevel: 4,
    sharedTo: undefined,
    sharing: Sharing.SHARED,
    startOfValidityUtc: undefined,
    type: GroupType.HARDCODED,
    updatedAtUtc: undefined,
    ...overrides
  },
  vessels: []
})

describe('MonitorFishWebWorker.getFilteredVesselGroups', () => {
  it('should split priority, pinned and unpinned groups', () => {
    const groups = [
      createGroup({ id: 1 }),
      createGroup({ id: 2 }),
      createPriorityGroup({ id: -1, name: 'Segments P1', priorityLevel: 4 })
    ]

    const result = MonitorFishWebWorker.getFilteredVesselGroups(groups, [2], undefined, undefined, undefined, false)

    expect(result.priorityVesselGroupsWithVessels.map(g => g.group.id)).toEqual([-1])
    expect(result.pinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([2])
    expect(result.unpinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([1])
  })

  it('should sort priority groups by descending priorityLevel (P1 before P2)', () => {
    const groups = [
      createPriorityGroup({ id: -2, name: 'Segments P2', priorityLevel: 3 }),
      createPriorityGroup({ id: -1, name: 'Segments P1', priorityLevel: 4 }),
      createGroup({ id: 1 })
    ]

    const result = MonitorFishWebWorker.getFilteredVesselGroups(groups, [], undefined, undefined, undefined, false)

    expect(result.priorityVesselGroupsWithVessels.map(g => g.group.name)).toEqual(['Segments P1', 'Segments P2'])
    expect(result.unpinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([1])
  })

  it('should return only priority groups when filteredPriority is true', () => {
    const groups = [
      createGroup({ id: 1 }),
      createGroup({ id: 2 }),
      createPriorityGroup({ id: -1, name: 'Segments P1', priorityLevel: 4 }),
      createPriorityGroup({ id: -2, name: 'Segments P2', priorityLevel: 3 })
    ]

    const result = MonitorFishWebWorker.getFilteredVesselGroups(
      groups,
      [],
      undefined,
      undefined,
      undefined,
      false,
      true
    )

    expect(result.priorityVesselGroupsWithVessels).toHaveLength(2)
    expect(result.pinnedVesselGroupsWithVessels).toHaveLength(0)
    expect(result.unpinnedVesselGroupsWithVessels).toHaveLength(0)
  })

  it('should filter by group type without affecting priority groups', () => {
    const groups = [
      createGroup({ id: 1, type: GroupType.DYNAMIC }),
      createGroup({ id: 2, type: GroupType.FIXED }),
      createPriorityGroup({ id: -1, name: 'Segments P1', priorityLevel: 4 })
    ]

    const result = MonitorFishWebWorker.getFilteredVesselGroups(
      groups,
      [],
      undefined,
      GroupType.DYNAMIC,
      undefined,
      false
    )

    expect(result.unpinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([1])
    expect(result.priorityVesselGroupsWithVessels).toHaveLength(0)
  })

  it('should filter out expired groups unless filteredExpired is true', () => {
    const yesterday = customDayjs().subtract(1, 'day').toISOString()
    const groups = [createGroup({ endOfValidityUtc: yesterday, id: 1 }), createGroup({ id: 2 })]

    const withoutExpired = MonitorFishWebWorker.getFilteredVesselGroups(
      groups,
      [],
      undefined,
      undefined,
      undefined,
      false
    )
    expect(withoutExpired.unpinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([2])

    const withExpired = MonitorFishWebWorker.getFilteredVesselGroups(groups, [], undefined, undefined, undefined, true)
    expect(withExpired.unpinnedVesselGroupsWithVessels.map(g => g.group.id)).toEqual([1, 2])
  })
})
