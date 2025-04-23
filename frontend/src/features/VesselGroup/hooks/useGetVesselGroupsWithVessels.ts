import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetVesselGroupsWithVesselsQuery } from '@features/VesselGroup/apis'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import type { VesselGroupWithVessels } from '@features/VesselGroup/types'

export function useGetVesselGroupsWithVessels(searchQuery: string | undefined): {
  pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
} {
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)

  const { data: vesselGroupsWithVessels } = useGetVesselGroupsWithVesselsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const fuse = useMemo(
    () =>
      new CustomSearch<VesselGroupWithVessels>(
        vesselGroupsWithVessels ?? [],
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
    [vesselGroupsWithVessels]
  )

  const filteredVesselGroupsWithVessels = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return vesselGroupsWithVessels ?? []
    }

    return fuse.find(searchQuery)
  }, [vesselGroupsWithVessels, fuse, searchQuery])

  const pinnedVesselGroupsWithVessels = filteredVesselGroupsWithVessels.filter(vesselGroup =>
    vesselGroupsIdsPinned.includes(vesselGroup.group.id)
  )
  const unpinnedVesselGroupsWithVessels = filteredVesselGroupsWithVessels.filter(
    vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.group.id)
  )

  return {
    pinnedVesselGroupsWithVessels,
    unpinnedVesselGroupsWithVessels
  }
}
