import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { GroupType, Sharing } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

export function useGetVesselGroups(filteredGroupTypes: GroupType[], filteredSharing: Sharing[]) {
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { data: vesselGroups } = useGetAllVesselGroupsQuery()

  return (() => {
    if (!vesselGroups?.length) {
      return {
        pinnedVesselGroups: [],
        unpinnedVesselGroups: []
      }
    }

    const filteredVesselGroups =
      vesselGroups
        ?.filter(vesselGroup => filteredGroupTypes.includes(vesselGroup.type))
        ?.filter(vesselGroup => filteredSharing.includes(vesselGroup.sharing)) ?? []

    const pinnedVesselGroups = filteredVesselGroups.filter(vesselGroup =>
      vesselGroupsIdsPinned.includes(vesselGroup.id)
    )
    const unpinnedVesselGroups = filteredVesselGroups.filter(
      vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.id)
    )

    return {
      pinnedVesselGroups,
      unpinnedVesselGroups
    }
  })()
}
