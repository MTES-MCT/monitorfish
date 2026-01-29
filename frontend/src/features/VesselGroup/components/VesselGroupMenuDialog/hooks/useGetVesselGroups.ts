import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { GroupType, Sharing } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs } from '@mtes-mct/monitor-ui'

export function useGetVesselGroups(filteredGroupType: GroupType | undefined, filteredSharing: Sharing | undefined) {
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
        ?.filter(vesselGroup => !filteredGroupType || vesselGroup.type === filteredGroupType)
        ?.filter(vesselGroup =>
          vesselGroup.endOfValidityUtc ? customDayjs(vesselGroup.endOfValidityUtc).isAfter(customDayjs(), 'day') : true
        )
        ?.filter(vesselGroup => !filteredSharing || vesselGroup.sharing === filteredSharing) ?? []

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
