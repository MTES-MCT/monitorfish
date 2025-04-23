import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

export function useGetVesselGroups() {
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { data: vesselGroups } = useGetAllVesselGroupsQuery()

  return (() => {
    if (!vesselGroups?.length) {
      return {
        pinnedVesselGroups: [],
        unpinnedVesselGroups: []
      }
    }

    const pinnedVesselGroups = vesselGroups.filter(vesselGroup => vesselGroupsIdsPinned.includes(vesselGroup.id))
    const unpinnedVesselGroups = vesselGroups.filter(vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.id))

    return {
      pinnedVesselGroups,
      unpinnedVesselGroups
    }
  })()
}
