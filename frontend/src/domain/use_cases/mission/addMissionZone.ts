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
      areVesselsDisplayed: false,
      isAlertsMapButtonDisplayed: false,
      isBeaconMalfunctionsMapButtonDisplayed: false,
      isDrawLayerModalDisplayed: true,
      isFavoriteVesselsMapButtonDisplayed: false,
      isInterestPointMapButtonDisplayed: false,
      isMeasurementMapButtonDisplayed: false,
      isMissionsLayerDisplayed: false,
      isMissionsMapButtonDisplayed: false,
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
      areVesselsDisplayed: true,
      isAlertsMapButtonDisplayed: true,
      isBeaconMalfunctionsMapButtonDisplayed: true,
      isDrawLayerModalDisplayed: false,
      isFavoriteVesselsMapButtonDisplayed: true,
      isInterestPointMapButtonDisplayed: true,
      isMeasurementMapButtonDisplayed: true,
      isMissionsLayerDisplayed: true,
      isMissionsMapButtonDisplayed: true,
      isVesselFiltersMapButtonDisplayed: true,
      isVesselLabelsMapButtonDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityMapButtonDisplayed: true
    })
  )
}
