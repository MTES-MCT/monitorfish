import { InteractionListener, InteractionType } from '../../entities/map/constants'
import { setDisplayedComponents } from '../../shared_slices/DisplayedComponent'
import { setGeometry, setInteractionTypeAndListener } from '../../shared_slices/Draw'
import { fitToExtent } from '../../shared_slices/Map'
import { getCoordinatesExtent } from '../map/getCoordinatesExtent'

import type { MainAppThunk } from '../../../store'
import type { GeoJSON as GeoJSONNamespace } from '../../types/GeoJSON'
import type { Coordinate } from 'ol/coordinate'

export const addControlCoordinates =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk<void> =>
  dispatch => {
    if (geometry) {
      dispatch(setGeometry(geometry))
      const featureCoordinates = (geometry as GeoJSONNamespace.Point).coordinates
      const bufferedExtent = getCoordinatesExtent(featureCoordinates as Coordinate)
      dispatch(fitToExtent(bufferedExtent))
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.CONTROL_POINT,
        type: InteractionType.POINT
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
