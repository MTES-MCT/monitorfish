import { batch } from 'react-redux'

import { getVesselFromAPI } from '../../../api/vessel'
import { addVesselIdentifierToVesselIdentity } from '../../../features/vessel_search/utils'
import { getVesselCompositeIdentifier, VesselSidebarTab } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, getTrackResponseError } from '../../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../../shared_slices/FishingActivities'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { loadingVessel, resetLoadingVessel, setSelectedVessel, showVesselSidebarTab } from '../../shared_slices/Vessel'

import type { VesselIdentity } from '../../entities/vessel/types'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const showVessel =
  (vesselIdentity: VesselIdentity, fromSearch: boolean, calledFromCron: boolean) => async (dispatch, getState) => {
    const { fishingActivities, global, map, vessel } = getState()
    const { selectedVesselTrackRequest, vessels } = vessel
    const { defaultVesselTrackDepth } = map
    const { areFishingActivitiesShowedOnMap } = fishingActivities
    const { isAdmin } = global

    const lastPositionVessel = vessels.find(
      _vessel => _vessel.vesselCompositeIdentifier === getVesselCompositeIdentifier(vesselIdentity)
    )

    dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)
    const nextTrackRequest = getCustomOrDefaultTrackRequest(selectedVesselTrackRequest, defaultVesselTrackDepth, false)
    if (areFishingActivitiesShowedOnMap && !calledFromCron) {
      dispatch(removeFishingActivitiesFromMap())
    }

    if (fromSearch) {
      dispatch(addSearchedVessel(vesselIdentity))
    }

    if (!isAdmin) {
      dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))
    }

    return getVesselFromAPI(vesselIdentity, nextTrackRequest)
      .then(({ trackDepthHasBeenModified, vesselAndPositions }) => {
        const error = getTrackResponseError(
          vesselAndPositions.positions,
          trackDepthHasBeenModified,
          calledFromCron,
          nextTrackRequest
        )

        const selectedVessel = {
          ...lastPositionVessel?.vesselProperties,
          ...vesselAndPositions?.vessel,
          vesselIdentifier: addVesselIdentifierToVesselIdentity(vesselIdentity).vesselIdentifier
        }

        if (error) {
          dispatch(setError(error))
        }

        return dispatch(
          setSelectedVessel({
            positions: vesselAndPositions.positions,
            vessel: selectedVessel
          })
        )
      })
      .catch(error => {
        console.error(error)
        dispatch(setError(error))
        dispatch(resetLoadingVessel())
      })
  }

function dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity) {
  batch(() => {
    dispatch(doNotAnimate(calledFromCron))
    dispatch(removeError())
    dispatch(
      loadingVessel({
        calledFromCron,
        vesselIdentity
      })
    )
  })
}
