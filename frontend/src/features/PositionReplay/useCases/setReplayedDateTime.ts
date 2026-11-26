import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { getVesselLogbookAtDateTime } from '@features/Logbook/useCases/getVesselLogbookAtDateTime'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { positionReplayActions } from '@features/PositionReplay/slice'

import type { MainAppThunk } from '@store'

/**
 * Replays the positions at another date, with the logbook of the selected vessel at this date.
 * Its track follows with the positions fetched at this date.
 */
export const setReplayedDateTime =
  (dateTime: string | undefined): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(positionReplayActions.setDateTime(dateTime))

    const positionsDateTime = selectPositionsDateTime(getState())
    const { selectedVesselIdentity } = getState().vessel
    if (!positionsDateTime || !selectedVesselIdentity) {
      return
    }

    await dispatch(getVesselLogbookAtDateTime(selectedVesselIdentity, positionsDateTime))
    await dispatch(displayLogbookMessageOverlays())
  }
