import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetVesselGroupsWithVesselsQuery } from '@features/VesselGroup/apis'
import { GroupType, type VesselGroupWithVessels } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { MonitorFishWorker } from '../../../../../workers/MonitorFishWorker'

export function useGetVesselGroupsWithVessels(filteredGroupTypes: GroupType[]): {
  pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
} {
  const [result, setResult] = useState<{
    pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
    unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  }>({
    pinnedVesselGroupsWithVessels: [],
    unpinnedVesselGroupsWithVessels: []
  })
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)
  const searchQuery = useMainAppSelector(state => state.vesselGroupList.searchQuery)
  const { data: vesselGroupsWithVessels } = useGetVesselGroupsWithVesselsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const debouncedSearch = useDebouncedCallback(
    async (debouncedSearchQuery: string | undefined, debouncedFilteredGroupTypes: GroupType[]) => {
      const nextGroups = await MonitorFishWorker.getFilteredVesselGroups(
        vesselGroupsWithVessels ?? [],
        vesselGroupsIdsPinned,
        debouncedSearchQuery,
        debouncedFilteredGroupTypes
      )

      setResult(nextGroups)
    },
    250
  )

  useEffect(() => {
    debouncedSearch(searchQuery, filteredGroupTypes)
  }, [searchQuery, debouncedSearch, filteredGroupTypes, vesselGroupsIdsPinned, vesselGroupsWithVessels])

  return result
}
