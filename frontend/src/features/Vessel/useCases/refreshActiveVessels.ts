import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { saveActiveVesselsAndDisplayLastPositions } from '@features/Vessel/useCases/saveActiveVesselsAndDisplayLastPositions'
import { vesselApi } from '@features/Vessel/vesselApi'

import type { MainAppThunk } from '@store'

/**
 * While replaying, the replayed vessels are kept displayed: the active vessels are refetched when quitting the replay.
 */
export const refreshActiveVessels = (): MainAppThunk<Promise<void>> => async (dispatch, getState) => {
  if (selectIsPositionReplayActive(getState())) {
    return
  }

  const vessels = await dispatch(
    vesselApi.endpoints.getActiveVessels.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
  ).unwrap()
  dispatch(saveActiveVesselsAndDisplayLastPositions(vessels))
}
