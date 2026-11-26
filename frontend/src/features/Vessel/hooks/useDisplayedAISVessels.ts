import { TWO_MINUTES } from '@constants/index'
import { useDisplayedQueryResult } from '@features/PositionReplay/hooks/useDisplayedQueryResult'
import { selectIsPositionReplayActive, selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { useGetAISVesselsAtDateTimeQuery, useGetAISVesselsQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { skipToken } from '@reduxjs/toolkit/query'

import type { VesselLocation } from '@features/Vessel/types/vessel'
import type { MainRootState } from '@store'

export const selectAreAISVesselsFetched = (state: MainRootState): boolean =>
  import.meta.env.FRONTEND_AIS_VESSELS_ENABLED === 'true' && state.displayedComponent.areAISVesselsDisplayed

/**
 * The polled AIS vessels, or the AIS vessels at the replayed date.
 */
export function useDisplayedAISVessels(vesselLocation: VesselLocation | undefined) {
  const areAISVesselsFetched = useMainAppSelector(selectAreAISVesselsFetched)
  const isPositionReplayActive = useMainAppSelector(selectIsPositionReplayActive)
  const replayedDateTime = useMainAppSelector(selectPositionsDateTime)

  const currentAISVesselsQueryResult = useGetAISVesselsQuery(vesselLocation, {
    pollingInterval: TWO_MINUTES,
    skip: !areAISVesselsFetched || isPositionReplayActive
  })
  const replayedAISVesselsQueryResult = useGetAISVesselsAtDateTimeQuery(replayedDateTime ?? skipToken, {
    skip: !areAISVesselsFetched || !isPositionReplayActive
  })

  return useDisplayedQueryResult(currentAISVesselsQueryResult, replayedAISVesselsQueryResult)
}
