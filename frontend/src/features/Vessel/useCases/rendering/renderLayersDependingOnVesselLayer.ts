import { renderVesselAlertAndBeaconMalfunctionFeatures } from '@features/Vessel/useCases/rendering/renderVesselAlertAndBeaconMalfunctionFeatures'
import { renderVesselAlertFeatures } from '@features/Vessel/useCases/rendering/renderVesselAlertFeatures'
import { renderVesselBeaconMalfunctionFeatures } from '@features/Vessel/useCases/rendering/renderVesselBeaconMalfunctionFeatures'
import { renderVesselEstimatedPositionFeatures } from '@features/Vessel/useCases/rendering/renderVesselEstimatedPositionFeatures'
import { renderVesselInfractionSuspicionFeatures } from '@features/Vessel/useCases/rendering/renderVesselInfractionSuspicionFeatures'

import type { MainAppThunk } from '@store'

export const renderLayersDependingOnVesselLayer = (): MainAppThunk => async dispatch => {
  dispatch(renderVesselInfractionSuspicionFeatures())
  dispatch(renderVesselAlertAndBeaconMalfunctionFeatures())
  dispatch(renderVesselBeaconMalfunctionFeatures())
  dispatch(renderVesselAlertFeatures())
  dispatch(renderVesselEstimatedPositionFeatures())
}
