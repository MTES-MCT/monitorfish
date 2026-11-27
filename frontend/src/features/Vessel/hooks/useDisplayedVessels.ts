import { FIVE_MINUTES, TWENTY_MINUTES } from '@constants/index'
import { useDisplayedQueryResult } from '@features/PositionReplay/hooks/useDisplayedQueryResult'
import { selectIsPositionReplayActive, selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { useGetActiveVesselsQuery, useGetVesselsAtDateTimeQuery } from '@features/Vessel/vesselApi'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { skipToken } from '@reduxjs/toolkit/query'

import type { Vessel } from '@features/Vessel/Vessel.types'

/** While another date is fetched, the previous replayed vessels are kept. */
export function useDisplayedVessels() {
  const isInLightMode = useIsInLightMode()
  const isPositionReplayActive = useMainAppSelector(selectIsPositionReplayActive)
  const replayedDateTime = useMainAppSelector(selectPositionsDateTime)

  const activeVesselsQueryResult = useGetActiveVesselsQuery(undefined, {
    pollingInterval: isInLightMode ? TWENTY_MINUTES : FIVE_MINUTES,
    skip: isPositionReplayActive
  })
  const replayedVesselsQueryResult = useGetVesselsAtDateTimeQuery(replayedDateTime ?? skipToken, {
    skip: !isPositionReplayActive
  })

  return useDisplayedQueryResult<Vessel.DisplayedVessel>(activeVesselsQueryResult, replayedVesselsQueryResult)
}
