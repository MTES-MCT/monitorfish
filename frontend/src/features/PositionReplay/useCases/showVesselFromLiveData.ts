import { liveVesselConfirmationActions } from '@features/PositionReplay/liveVesselConfirmationSlice'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { quitPositionReplay } from '@features/PositionReplay/useCases/quitPositionReplay'
import { showVessel } from '@features/Vessel/useCases/showVessel'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Shows a vessel opened from live data (an alert, a prior notification...).
 * While positions are replayed, the user is asked whether to quit the replay to see the vessel as it is now.
 */
export const showVesselFromLiveData =
  (vesselIdentity: Vessel.VesselIdentity): MainAppThunk =>
  (dispatch, getState) => {
    if (selectIsPositionReplayActive(getState())) {
      dispatch(liveVesselConfirmationActions.ask(vesselIdentity))

      return
    }

    dispatch(showVessel(vesselIdentity, false))
  }

export const quitPositionReplayAndShowVessel =
  (vesselIdentity: Vessel.VesselIdentity): MainAppThunk =>
  dispatch => {
    dispatch(liveVesselConfirmationActions.close())
    dispatch(quitPositionReplay())
    dispatch(showVessel(vesselIdentity, false))
  }

export const showVesselAtReplayedDate =
  (vesselIdentity: Vessel.VesselIdentity): MainAppThunk =>
  dispatch => {
    dispatch(liveVesselConfirmationActions.close())
    dispatch(showVessel(vesselIdentity, false))
  }
