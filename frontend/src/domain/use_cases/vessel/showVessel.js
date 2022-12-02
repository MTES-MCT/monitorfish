import { batch } from 'react-redux'
import {
  getOnlyVesselIdentityProperties,
  getVesselCompositeIdentifier,
  VesselSidebarTab
} from '../../entities/vessel/vessel'
import { loadingVessel, resetLoadingVessel, setSelectedVessel, showVesselSidebarTab } from '../../shared_slices/Vessel'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { getCustomOrDefaultTrackRequest, getTrackResponseError } from '../../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../../shared_slices/FishingActivities'
import { getVesselFromAPI } from '../../../api/vessel'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 * @function showVessel
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {boolean} fromSearch
 */
const showVessel = (vesselIdentity, fromSearch, calledFromCron) => async (dispatch, getState) => {
  vesselIdentity = getOnlyVesselIdentityProperties(vesselIdentity)

  const { vessel, fishingActivities, map, global } = getState()
  const { vessels, selectedVesselTrackRequest } = vessel
  const { defaultVesselTrackDepth } = map
  const { areFishingActivitiesShowedOnMap } = fishingActivities
  const { isAdmin } = global

  const lastPositionVessel = vessels.find(_vessel => _vessel.vesselCompositeIdentifier === getVesselCompositeIdentifier(vesselIdentity))

  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextTrackRequest = getCustomOrDefaultTrackRequest(selectedVesselTrackRequest, defaultVesselTrackDepth, false)
  if (areFishingActivitiesShowedOnMap && !calledFromCron) {
    dispatch(removeFishingActivitiesFromMap())
  }

  if (fromSearch && addSearchedVessel) {
    dispatch(addSearchedVessel(vesselIdentity))
  }

  if (!isAdmin) {
    dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))
  }

  return getVesselFromAPI(vesselIdentity, nextTrackRequest)
    .then(({ vesselAndPositions, trackDepthHasBeenModified }) => {
      const error = getTrackResponseError(
        vesselAndPositions.positions,
        trackDepthHasBeenModified,
        calledFromCron,
        nextTrackRequest
      )

      const selectedVessel = {
        ...vesselIdentity,
        ...vesselAndPositions?.vessel,
        ...lastPositionVessel?.vesselProperties,
        globalRiskFactor: vesselIdentity?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor
      }

      batch(() => {
        if (error && setError) {
          dispatch(setError(error))
        } else if (removeError) {
          dispatch(removeError())
        }

        return dispatch(
          setSelectedVessel({
            vessel: selectedVessel,
            positions: vesselAndPositions.positions
          })
        )
      })
    })
    .catch(error => {
      console.error(error)
      batch(() => {
        if (setError) {
          dispatch(setError(error))
        }

        dispatch(resetLoadingVessel())
      })
    })
}

function dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity) {
  batch(() => {
    dispatch(doNotAnimate(calledFromCron))
    if (removeError) {
      dispatch(removeError(undefined))
    }
    dispatch(
      loadingVessel({
        vesselIdentity,
        calledFromCron
      })
    )
  })
}

export default showVessel
