import { GroupType, type HardcodedPriorityVesselGroup, type VesselGroup, Sharing } from '@features/VesselGroup/types'
import { isPriorityGroup } from '@features/VesselGroup/utils/utils'
import { customDayjs } from '@mtes-mct/monitor-ui'

export function getFilteredVesselGroups(
  vesselGroups: VesselGroup[] | undefined,
  filteredGroupType: GroupType | undefined,
  filteredSharing: Sharing | undefined,
  vesselGroupsIdsPinned: number[],
  filteredPriority: boolean = false
): { pinnedVesselGroups: VesselGroup[]; priorityVesselGroups: VesselGroup[]; unpinnedVesselGroups: VesselGroup[] } {
  if (!vesselGroups?.length) {
    return { pinnedVesselGroups: [], priorityVesselGroups: [], unpinnedVesselGroups: [] }
  }

  const filtered = vesselGroups
    .filter(group => !filteredGroupType || group.type === filteredGroupType)
    .filter(group =>
      group.endOfValidityUtc ? customDayjs(group.endOfValidityUtc).isAfter(customDayjs(), 'day') : true
    )
    .filter(group => !filteredSharing || group.sharing === filteredSharing)
    .filter(group => !filteredPriority || isPriorityGroup(group))

  const priorityVesselGroups = filtered
    .filter(isPriorityGroup)
    .sort(
      (a, b) =>
        ((b as HardcodedPriorityVesselGroup).priorityLevel ?? 0) -
        ((a as HardcodedPriorityVesselGroup).priorityLevel ?? 0)
    )
  const otherVesselGroups = filtered.filter(group => !isPriorityGroup(group))

  return {
    pinnedVesselGroups: otherVesselGroups.filter(
      group => group.id !== null && vesselGroupsIdsPinned.includes(group.id)
    ),
    priorityVesselGroups,
    unpinnedVesselGroups: otherVesselGroups.filter(
      group => group.id === null || !vesselGroupsIdsPinned.includes(group.id)
    )
  }
}
