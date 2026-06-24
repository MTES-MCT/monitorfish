import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetVesselGroupsWithVesselsQuery } from '@features/VesselGroup/apis'
import { GroupType, Sharing, type VesselGroupWithVessels } from '@features/VesselGroup/types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { MonitorFishWorker } from '../../../../../workers/MonitorFishWorker'

export function useGetVesselGroupsWithVessels(
  filteredGroupType: GroupType | undefined,
  filteredSharing: Sharing | undefined,
  filteredExpired: boolean,
  filteredPriority: boolean
): {
  isLoading: boolean
  pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  priorityVesselGroupsWithVessels: VesselGroupWithVessels[]
  unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
} {
  const [result, setResult] = useState<{
    isLoading: boolean
    pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
    priorityVesselGroupsWithVessels: VesselGroupWithVessels[]
    unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  }>({
    isLoading: true,
    pinnedVesselGroupsWithVessels: [],
    priorityVesselGroupsWithVessels: [],
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
      debouncedFilteredGroupType: GroupType | undefined,
      debouncedFilteredSharing: Sharing | undefined,
      debouncedFilteredExpired: boolean,
      debouncedFilteredPriority: boolean,
      debouncedIsLoading: boolean
    ) => {
      if (debouncedIsLoading) {
        return
      }

      const nextGroups = await MonitorFishWorker.getFilteredVesselGroups(
        vesselGroupsWithVessels ?? [],
        vesselGroupsIdsPinned,
        debouncedSearchQuery,
        debouncedFilteredGroupType,
        debouncedFilteredSharing,
        debouncedFilteredExpired,
        debouncedFilteredPriority
      )

      setResult({
        isLoading: false,
        pinnedVesselGroupsWithVessels: nextGroups.pinnedVesselGroupsWithVessels,
        priorityVesselGroupsWithVessels: nextGroups.priorityVesselGroupsWithVessels,
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

    debouncedSearch(searchQuery, filteredGroupType, filteredSharing, filteredExpired, filteredPriority, isLoading)
  }, [
    searchQuery,
    isLoading,
    debouncedSearch,
    filteredGroupType,
    filteredSharing,
    filteredExpired,
    filteredPriority,
    vesselGroupsIdsPinned,
    vesselGroupsWithVessels
  ])

  return result
}
