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
      isAlertsLeftMenuButtonDisplayed: false,
      isBeaconMalfunctionsLeftMenuButtonDisplayed: false,
      isControlUnitListMapButtonDisplayed: false,
      isDrawLayerModalDisplayed: true,
      isFavoriteVesselsLeftMenuButtonDisplayed: false,
      isInterestPointRightMenuButtonDisplayed: false,
      isMeasurementRightMenuButtonDisplayed: false,
      isMissionsLayerDisplayed: false,
      isMissionsLeftMenuButtonDisplayed: false,
      isPriorNotificationLeftMenuButtonDisplayed: false,
      isVesselFiltersRightMenuButtonDisplayed: false,
      isVesselLabelsRightMenuButtonDisplayed: false,
      isVesselListDisplayed: false,
      isVesselSearchDisplayed: false,
      isVesselVisibilityRightMenuButtonDisplayed: false
    })
  )
}

export const closeDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedComponents({
      areVesselsDisplayed: true,
      isAccountMapButtonDisplayed: true,
      isAlertsLeftMenuButtonDisplayed: true,
      isBeaconMalfunctionsLeftMenuButtonDisplayed: true,
      isControlUnitListMapButtonDisplayed: true,
      isDrawLayerModalDisplayed: false,
      isFavoriteVesselsLeftMenuButtonDisplayed: true,
      isInterestPointRightMenuButtonDisplayed: true,
      isMeasurementRightMenuButtonDisplayed: true,
      isMissionsLayerDisplayed: true,
      isMissionsLeftMenuButtonDisplayed: true,
      isPriorNotificationLeftMenuButtonDisplayed: true,
      isVesselFiltersRightMenuButtonDisplayed: true,
      isVesselLabelsRightMenuButtonDisplayed: true,
      isVesselListDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityRightMenuButtonDisplayed: true
    })
  )
}
