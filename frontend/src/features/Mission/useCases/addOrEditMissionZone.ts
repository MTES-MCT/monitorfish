import { InteractionListener, InteractionType } from '../../../domain/entities/map/constants'
import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { fitMultiPolygonToExtent } from '../../../domain/use_cases/map/fitMultiPolygonToExtent'
import { unselectVessel } from '../../../domain/use_cases/vessel/unselectVessel'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'

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
      isPriorNotificationMapButtonDisplayed: true,
      isVesselFiltersMapButtonDisplayed: true,
      isVesselLabelsMapButtonDisplayed: true,
      isVesselListDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityMapButtonDisplayed: true
    })
  )
}
