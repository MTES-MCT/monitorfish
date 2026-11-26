import { hideVesselsTracks } from '@features/Vessel/useCases/hideVesselsTracks'
import { renderVesselEstimatedPositionFeatures } from '@features/Vessel/useCases/rendering/renderVesselEstimatedPositionFeatures'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'

import type { MainAppThunk } from '@store'

/**
 * The vessel tracks and the selected vessel logbook are fetched for the current trip or for the replayed date:
 * they are closed when entering or leaving the replay, to be reopened with the matching data.
 * The estimated positions are rendered outside React, so they are redrawn explicitly.
 */
export const resetDisplayedVesselData = (): MainAppThunk => dispatch => {
  dispatch(unselectVessel())
  dispatch(hideVesselsTracks())
  dispatch(renderVesselEstimatedPositionFeatures())
}
