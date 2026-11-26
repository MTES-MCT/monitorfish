import { positionReplayActions } from '@features/PositionReplay/slice'
import { resetDisplayedVesselData } from '@features/PositionReplay/useCases/resetDisplayedVesselData'

import type { MainAppThunk } from '@store'

export const startPositionReplay = (): MainAppThunk => dispatch => {
  dispatch(positionReplayActions.start())
  dispatch(resetDisplayedVesselData())
}
