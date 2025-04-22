import { mapActions } from '@features/Map/slice'
import { renderVesselEstimatedPositionFeatures } from '@features/Vessel/useCases/rendering/renderVesselEstimatedPositionFeatures'

export const displayVesselsEstimatedPositions = (isDisplayed: boolean) => dispatch => {
  dispatch(mapActions.displayVesselsEstimatedPositions(isDisplayed))
  dispatch(renderVesselEstimatedPositionFeatures())
}
