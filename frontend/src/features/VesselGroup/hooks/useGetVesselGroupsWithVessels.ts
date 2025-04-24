import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetVesselGroupsWithVesselsQuery } from '@features/VesselGroup/apis'
import { GroupType, type VesselGroupWithVessels } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

export function useGetVesselGroupsWithVessels(
  searchQuery: string | undefined,
  filteredGroupTypes: GroupType[]
): {
  pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
} {
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { data: vesselGroupsWithVessels } = useGetVesselGroupsWithVesselsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const filteredVesselGroupsWithVesselsByGroupType = useMemo(
    () => vesselGroupsWithVessels?.filter(vesselGroup => filteredGroupTypes.includes(vesselGroup.group.type)) ?? [],
    [filteredGroupTypes, vesselGroupsWithVessels]
  )

  const fuse = useMemo(
    () =>
      new CustomSearch<VesselGroupWithVessels>(
        filteredVesselGroupsWithVesselsByGroupType,
        [
          {
            getFn: vesselGroupWithVessels => vesselGroupWithVessels.vessels.map(vessel => vessel.vesselName ?? ''),
            name: 'vessels.vesselName'
          },
          {
            getFn: vesselGroupWithVessels =>
              vesselGroupWithVessels.vessels.map(vessel => vessel.internalReferenceNumber ?? ''),
            name: 'vessels.internalReferenceNumber'
          },
          {
            getFn: vesselGroupWithVessels =>
              vesselGroupWithVessels.vessels.map(vessel => vessel.externalReferenceNumber ?? ''),
            name: 'vessels.externalReferenceNumber'
          },
          {
            getFn: vesselGroupWithVessels => vesselGroupWithVessels.vessels.map(vessel => vessel.ircs ?? ''),
            name: 'vessels.ircs'
          }
        ],
        { threshold: 0.4 }
      ),
    [filteredVesselGroupsWithVesselsByGroupType]
  )

  const filteredVesselGroupsWithVesselsBySearchQuery = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return filteredVesselGroupsWithVesselsByGroupType ?? []
    }

    return fuse.find(searchQuery)
  }, [filteredVesselGroupsWithVesselsByGroupType, fuse, searchQuery])

  const pinnedVesselGroupsWithVessels = filteredVesselGroupsWithVesselsBySearchQuery.filter(vesselGroup =>
    vesselGroupsIdsPinned.includes(vesselGroup.group.id)
  )
  const unpinnedVesselGroupsWithVessels = filteredVesselGroupsWithVesselsBySearchQuery.filter(
    vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.group.id)
  )

  return {
    pinnedVesselGroupsWithVessels,
    unpinnedVesselGroupsWithVessels
  }
}
