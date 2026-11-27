import { toReplayedDateTime } from '@features/PositionReplay/replayedDateTime'
import { positionReplayActions } from '@features/PositionReplay/slice'
import { resetDisplayedVesselData } from '@features/PositionReplay/useCases/resetDisplayedVesselData'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const startPositionReplay =
  (dateTime: string = toReplayedDateTime(customDayjs().startOf('minute'))): MainAppThunk =>
  dispatch => {
    dispatch(positionReplayActions.start(dateTime))
    dispatch(resetDisplayedVesselData())
  }
