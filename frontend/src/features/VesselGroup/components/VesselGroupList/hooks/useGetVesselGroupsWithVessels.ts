import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetVesselGroupsWithVesselsQuery } from '@features/VesselGroup/apis'
import { GroupType, Sharing, type VesselGroupWithVessels } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { MonitorFishWorker } from '../../../../../workers/MonitorFishWorker'

export function useGetVesselGroupsWithVessels(
  filteredGroupTypes: GroupType[],
  filteredSharing: Sharing[],
  filteredExpired: boolean
): {
  isLoading: boolean
  pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
} {
  const [result, setResult] = useState<{
    isLoading: boolean
    pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
    unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  }>({
    isLoading: true,
    pinnedVesselGroupsWithVessels: [],
    unpinnedVesselGroupsWithVessels: []
  })
  const vesselGroupsIdsPinned = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsPinned)
  const searchQuery = useMainAppSelector(state => state.vesselGroupList.searchQuery)
  const { data: vesselGroupsWithVessels, isLoading } = useGetVesselGroupsWithVesselsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )

  const debouncedSearch = useDebouncedCallback(
    async (
      debouncedSearchQuery: string | undefined,
      debouncedFilteredGroupTypes: GroupType[],
      debouncedFilteredSharing: Sharing[],
      debouncedFilteredExpired: boolean,
      debouncedIsLoading: boolean
    ) => {
      if (debouncedIsLoading) {
        return
      }

      const nextGroups = await MonitorFishWorker.getFilteredVesselGroups(
        vesselGroupsWithVessels ?? [],
        vesselGroupsIdsPinned,
        debouncedSearchQuery,
        debouncedFilteredGroupTypes,
        debouncedFilteredSharing,
        debouncedFilteredExpired
      )

      setResult({
        isLoading: false,
        pinnedVesselGroupsWithVessels: nextGroups.pinnedVesselGroupsWithVessels,
        unpinnedVesselGroupsWithVessels: nextGroups.unpinnedVesselGroupsWithVessels
      })
    },
    250
  )

  useEffect(() => {
    if (!isLoading) {
      // Set loading state immediately when filters change (but not during RTK query loading)
      setResult(prev => ({ ...prev, isLoading: true }))
    }

    debouncedSearch(searchQuery, filteredGroupTypes, filteredSharing, filteredExpired, isLoading)
  }, [
    searchQuery,
    isLoading,
    debouncedSearch,
    filteredGroupTypes,
    filteredSharing,
    filteredExpired,
    vesselGroupsIdsPinned,
    vesselGroupsWithVessels
  ])

  return result
}
