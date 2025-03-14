import { InteractionListener, InteractionType } from '@features/Map/constants'
import { fitMultiPolygonToExtent } from '@features/Map/useCases/fitMultiPolygonToExtent'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'
import { unselectVessel } from '../../Vessel/useCases/unselectVessel'

import type { GeoJSON as GeoJSONNamespace } from '../../../domain/types/GeoJSON'
import type { MainAppThunk } from '@store'

export const addOrEditMissionZone =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk =>
  dispatch => {
    dispatch(unselectVessel())

    if (geometry) {
      dispatch(setInitialGeometry(geometry))
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

export const openDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedComponents({
      areVesselsDisplayed: false,
      isAccountMapButtonDisplayed: false,
      isAlertsMapButtonDisplayed: false,
      isBeaconMalfunctionsMapButtonDisplayed: false,
      isControlUnitListMapButtonDisplayed: false,
      isDrawLayerModalDisplayed: true,
      isFavoriteVesselsMapButtonDisplayed: false,
      isInterestPointMapButtonDisplayed: false,
      isMeasurementMapButtonDisplayed: false,
      isMissionsLayerDisplayed: false,
      isMissionsMapButtonDisplayed: false,
      isNewFeaturesMapButtonDisplayed: false,
      isPriorNotificationMapButtonDisplayed: false,
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
      isAccountMapButtonDisplayed: true,
      isAlertsMapButtonDisplayed: true,
      isBeaconMalfunctionsMapButtonDisplayed: true,
      isControlUnitListMapButtonDisplayed: true,
      isDrawLayerModalDisplayed: false,
      isFavoriteVesselsMapButtonDisplayed: true,
      isInterestPointMapButtonDisplayed: true,
      isMeasurementMapButtonDisplayed: true,
      isMissionsLayerDisplayed: true,
      isMissionsMapButtonDisplayed: true,
      isNewFeaturesMapButtonDisplayed: true,
      isPriorNotificationMapButtonDisplayed: true,
      isVesselFiltersMapButtonDisplayed: true,
      isVesselLabelsMapButtonDisplayed: true,
      isVesselListDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityMapButtonDisplayed: true
    })
  )
}
