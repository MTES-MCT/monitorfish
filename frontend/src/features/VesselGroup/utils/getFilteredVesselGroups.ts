import { customDayjs } from '@mtes-mct/monitor-ui'

import type { GroupType, Sharing, VesselGroup } from '@features/VesselGroup/types'

export function getFilteredVesselGroups(
  vesselGroups: VesselGroup[] | undefined,
  filteredGroupType: GroupType | undefined,
  filteredSharing: Sharing | undefined,
  vesselGroupsIdsPinned: number[]
): { pinnedVesselGroups: VesselGroup[]; unpinnedVesselGroups: VesselGroup[] } {
  if (!vesselGroups?.length) {
    return { pinnedVesselGroups: [], unpinnedVesselGroups: [] }
  }

  const filtered = vesselGroups
    .filter(group => !filteredGroupType || group.type === filteredGroupType)
    .filter(group =>
      group.endOfValidityUtc ? customDayjs(group.endOfValidityUtc).isAfter(customDayjs(), 'day') : true
    )
    .filter(group => !filteredSharing || group.sharing === filteredSharing)

  return {
    pinnedVesselGroups: filtered.filter(group => vesselGroupsIdsPinned.includes(group.id)),
    unpinnedVesselGroups: filtered.filter(group => !vesselGroupsIdsPinned.includes(group.id))
  }
}
