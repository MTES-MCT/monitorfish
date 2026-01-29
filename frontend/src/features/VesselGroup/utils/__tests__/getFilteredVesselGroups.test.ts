import { GroupType, Sharing, type VesselGroup } from '@features/VesselGroup/types'
import { getFilteredVesselGroups } from '@features/VesselGroup/utils/getFilteredVesselGroups'
import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

const createMockVesselGroup = (overrides: Partial<VesselGroup> & { id: number }): VesselGroup =>
  ({
    color: '#12ad2b',
    createdAtUtc: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
    description: undefined,
    endOfValidityUtc: undefined,
    isDeleted: false,
    name: `Vessel Group ${overrides.id}`,
    pointsOfAttention: undefined,
    sharedTo: undefined,
    sharing: Sharing.PRIVATE,
    startOfValidityUtc: undefined,
    type: GroupType.FIXED,
    updatedAtUtc: undefined,
    vessels: [],
    ...overrides
  }) as VesselGroup

describe('getFilteredVesselGroups', () => {
  it('should return empty arrays when vesselGroups is undefined', () => {
    const result = getFilteredVesselGroups(undefined, undefined, undefined, [])

    expect(result).toEqual({ pinnedVesselGroups: [], unpinnedVesselGroups: [] })
  })

  it('should return empty arrays when vesselGroups is an empty array', () => {
    const result = getFilteredVesselGroups([], undefined, undefined, [])

    expect(result).toEqual({ pinnedVesselGroups: [], unpinnedVesselGroups: [] })
  })

  it('should return all groups as unpinned when no filters and no pinned IDs', () => {
    const vesselGroups = [createMockVesselGroup({ id: 1 }), createMockVesselGroup({ id: 2 })]

    const result = getFilteredVesselGroups(vesselGroups, undefined, undefined, [])

    expect(result.pinnedVesselGroups).toHaveLength(0)
    expect(result.unpinnedVesselGroups).toHaveLength(2)
    expect(result.unpinnedVesselGroups.map(g => g.id)).toEqual([1, 2])
  })

  it('should separate pinned and unpinned groups correctly', () => {
    const vesselGroups = [
      createMockVesselGroup({ id: 1 }),
      createMockVesselGroup({ id: 2 }),
      createMockVesselGroup({ id: 3 })
    ]

    const result = getFilteredVesselGroups(vesselGroups, undefined, undefined, [2])

    expect(result.pinnedVesselGroups).toHaveLength(1)
    expect(result.pinnedVesselGroups[0]?.id).toBe(2)
    expect(result.unpinnedVesselGroups).toHaveLength(2)
    expect(result.unpinnedVesselGroups.map(g => g.id)).toEqual([1, 3])
  })

  it('should filter by group type', () => {
    const vesselGroups = [
      createMockVesselGroup({ id: 1, type: GroupType.DYNAMIC }),
      createMockVesselGroup({ id: 2, type: GroupType.FIXED }),
      createMockVesselGroup({ id: 3, type: GroupType.DYNAMIC })
    ]

    const result = getFilteredVesselGroups(vesselGroups, GroupType.DYNAMIC, undefined, [])

    expect(result.unpinnedVesselGroups).toHaveLength(2)
    expect(result.unpinnedVesselGroups.map(g => g.id)).toEqual([1, 3])
  })

  it('should filter by sharing type', () => {
    const vesselGroups = [
      createMockVesselGroup({ id: 1, sharing: Sharing.PRIVATE }),
      createMockVesselGroup({ id: 2, sharing: Sharing.SHARED }),
      createMockVesselGroup({ id: 3, sharing: Sharing.PRIVATE })
    ]

    const result = getFilteredVesselGroups(vesselGroups, undefined, Sharing.SHARED, [])

    expect(result.unpinnedVesselGroups).toHaveLength(1)
    expect(result.unpinnedVesselGroups[0]?.id).toBe(2)
  })

  it('should filter out expired groups', () => {
    const yesterday = customDayjs().subtract(1, 'day').toISOString()
    const tomorrow = customDayjs().add(1, 'day').toISOString()

    const vesselGroups = [
      createMockVesselGroup({ endOfValidityUtc: yesterday, id: 1 }),
      createMockVesselGroup({ endOfValidityUtc: tomorrow, id: 2 }),
      createMockVesselGroup({ endOfValidityUtc: undefined, id: 3 })
    ]

    const result = getFilteredVesselGroups(vesselGroups, undefined, undefined, [])

    expect(result.unpinnedVesselGroups).toHaveLength(2)
    expect(result.unpinnedVesselGroups.map(g => g.id)).toEqual([2, 3])
  })

  it('should combine all filters correctly', () => {
    const tomorrow = customDayjs().add(1, 'day').toISOString()
    const yesterday = customDayjs().subtract(1, 'day').toISOString()

    const vesselGroups = [
      createMockVesselGroup({ endOfValidityUtc: tomorrow, id: 1, sharing: Sharing.SHARED, type: GroupType.DYNAMIC }),
      createMockVesselGroup({ endOfValidityUtc: tomorrow, id: 2, sharing: Sharing.SHARED, type: GroupType.FIXED }),
      createMockVesselGroup({ endOfValidityUtc: tomorrow, id: 3, sharing: Sharing.PRIVATE, type: GroupType.DYNAMIC }),
      createMockVesselGroup({ endOfValidityUtc: yesterday, id: 4, sharing: Sharing.SHARED, type: GroupType.DYNAMIC }),
      createMockVesselGroup({ endOfValidityUtc: undefined, id: 5, sharing: Sharing.SHARED, type: GroupType.DYNAMIC })
    ]

    const result = getFilteredVesselGroups(vesselGroups, GroupType.DYNAMIC, Sharing.SHARED, [5])

    expect(result.pinnedVesselGroups).toHaveLength(1)
    expect(result.pinnedVesselGroups[0]?.id).toBe(5)
    expect(result.unpinnedVesselGroups).toHaveLength(1)
    expect(result.unpinnedVesselGroups[0]?.id).toBe(1)
  })
})
