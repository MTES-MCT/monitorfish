import { getVesselFromAPI } from '../../../api/vessel'
import { addVesselIdentifierToVesselIdentity } from '../../../features/vessel_search/utils'
import { Vessel, VesselSidebarTab } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../../shared_slices/FishingActivities'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { loadingVessel, resetLoadingVessel, setSelectedVessel, showVesselSidebarTab } from '../../shared_slices/Vessel'

import type { VesselIdentity } from '../../entities/vessel/types'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const showVessel =
  (vesselIdentity: VesselIdentity, isFromSearch: boolean, isCalledFromCron: boolean) => async (dispatch, getState) => {
    try {
      const { fishingActivities, global, map, vessel } = getState()
      const { selectedVesselTrackRequest, vessels } = vessel
      const { defaultVesselTrackDepth } = map
      const { areFishingActivitiesShowedOnMap } = fishingActivities
      const { isAdmin } = global

      const vesselFeatureId = Vessel.getVesselFeatureId(vesselIdentity)
      const selectedVesselLastPosition = vessels.find(
        lastPosition => lastPosition.vesselFeatureId === vesselFeatureId
      )?.vesselProperties

      dispatchLoadingVessel(dispatch, isCalledFromCron, vesselIdentity)
      const nextTrackRequest = getCustomOrDefaultTrackRequest(
        selectedVesselTrackRequest,
        defaultVesselTrackDepth,
        false
      )
      if (areFishingActivitiesShowedOnMap && !isCalledFromCron) {
        dispatch(removeFishingActivitiesFromMap())
      }

      if (isFromSearch) {
        dispatch(addSearchedVessel(vesselIdentity))
      }

      if (!isAdmin) {
        dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))
      }

      const { isTrackDepthModified, vesselAndPositions } = await getVesselFromAPI(vesselIdentity, nextTrackRequest)
      try {
        throwCustomErrorFromAPIFeedback(vesselAndPositions.positions, isTrackDepthModified, isCalledFromCron)
      } catch (error) {
        dispatch(setError(error))
      }

      const selectedVessel = {
        ...selectedVesselLastPosition,
        ...vesselAndPositions?.vessel,
        globalRiskFactor: selectedVesselLastPosition?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor,
        vesselIdentifier: addVesselIdentifierToVesselIdentity(vesselIdentity).vesselIdentifier
      }

      return dispatch(
        setSelectedVessel({
          positions: vesselAndPositions.positions,
          vessel: selectedVessel
        })
      )
    } catch (error) {
      dispatch(setError(error))
      dispatch(resetLoadingVessel())

      return undefined
    }
  }

function dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity) {
  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())
  dispatch(
    loadingVessel({
      calledFromCron,
      vesselIdentity
    })
  )
}
