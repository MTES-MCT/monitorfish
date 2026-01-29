import { useGetAllVesselGroupsQuery } from '@features/VesselGroup/apis'
import { GroupType, Sharing } from '@features/VesselGroup/types'
import { getFilteredVesselGroups } from '@features/VesselGroup/utils/getFilteredVesselGroups'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

export function useGetVesselGroups(filteredGroupType: GroupType | undefined, filteredSharing: Sharing | undefined) {
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)
  const { data: vesselGroups } = useGetAllVesselGroupsQuery()

  return getFilteredVesselGroups(vesselGroups, filteredGroupType, filteredSharing, vesselGroupsIdsPinned)
}
