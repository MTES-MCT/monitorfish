import { InteractionListener, InteractionType } from '../../entities/map/constants'
import { setDisplayedComponents } from '../../shared_slices/DisplayedComponent'
import { setGeometry, setInteractionTypeAndListener } from '../../shared_slices/Draw'
import { fitMultiPolygonToExtent } from '../map/fitMultiPolygonToExtent'

import type { MainAppThunk } from '../../../store'
import type { GeoJSON as GeoJSONNamespace } from '../../types/GeoJSON'

export const addMissionZone =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk<void> =>
  dispatch => {
    if (geometry) {
      dispatch(setGeometry(geometry))
      dispatch(fitMultiPolygonToExtent(geometry))
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.MISSION_ZONE,
        type: InteractionType.POLYGON
      })
    )
  }

const openDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedComponents({
      isDrawLayerModalDisplayed: true,
      isInterestPointMapButtonDisplayed: false,
      isMeasurementMapButtonDisplayed: false,
      isVesselFiltersMapButtonDisplayed: false,
      isVesselLabelsMapButtonDisplayed: false,
      isVesselListDisplayed: false,
      isVesselSearchDisplayed: false,
      isVesselVisibilityMapButtonDisplayed: false
    })
  )
}

export const closeDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedComponents({
      isDrawLayerModalDisplayed: false,
      isInterestPointMapButtonDisplayed: true,
      isMeasurementMapButtonDisplayed: true,
      isVesselFiltersMapButtonDisplayed: true,
      isVesselLabelsMapButtonDisplayed: true,
      isVesselListDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityMapButtonDisplayed: true
    })
  )
}
