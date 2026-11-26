import { RtkCacheTagType } from '@api/constants'
import { positionReplayActions } from '@features/PositionReplay/slice'
import { resetDisplayedVesselData } from '@features/PositionReplay/useCases/resetDisplayedVesselData'
import { vesselApi } from '@features/Vessel/vesselApi'

import type { MainAppThunk } from '@store'

/**
 * The cached active vessels are refetched, as they may be outdated after a long replay.
 */
export const quitPositionReplay = (): MainAppThunk => dispatch => {
  dispatch(positionReplayActions.reset())
  dispatch(resetDisplayedVesselData())
  dispatch(vesselApi.util.invalidateTags([{ type: RtkCacheTagType.ActiveVessels }]))
}
