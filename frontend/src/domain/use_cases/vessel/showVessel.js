import { batch } from 'react-redux'
import { getOnlyVesselIdentityProperties, Vessel, VesselSidebarTab } from '../../entities/vessel'
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
  const {
    vessels,
    selectedVesselCustomTrackRequest
  } = vessel
  const {
    defaultVesselTrackDepth
  } = map
  const {
    fishingActivitiesAreShowedOnMap
  } = fishingActivities
  const {
    adminRole
  } = global

  const lastPositionVessel = vessels.find(vessel => vessel.vesselId === Vessel.getVesselFeatureId(vesselIdentity))

  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextTrackRequest = getCustomOrDefaultTrackRequest(selectedVesselCustomTrackRequest, defaultVesselTrackDepth, false)
  if (fishingActivitiesAreShowedOnMap && !calledFromCron) {
    dispatch(removeFishingActivitiesFromMap())
  }

  if (fromSearch) {
    dispatch(addSearchedVessel(vesselIdentity))
  }

  if (!adminRole) {
    dispatch(showVesselSidebarTab(VesselSidebarTab.IDENTITY))
  }

  return getVesselFromAPI(vesselIdentity, nextTrackRequest)
    .then(({ vesselAndPositions, trackDepthHasBeenModified }) => {
      const error = getTrackResponseError(
        vesselAndPositions.positions,
        trackDepthHasBeenModified,
        calledFromCron,
        nextTrackRequest)

      const selectedVessel = {
        ...vesselIdentity,
        ...vesselAndPositions?.vessel,
        ...lastPositionVessel?.vesselProperties,
        globalRiskFactor: vesselIdentity?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor
      }

      batch(() => {
        if (error) {
          dispatch(setError(error))
        } else {
          dispatch(removeError())
        }

        return dispatch(setSelectedVessel({
          vessel: selectedVessel,
          positions: vesselAndPositions.positions
        }))
      })
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setError(error))
        dispatch(resetLoadingVessel())
      })
    })
}

function dispatchLoadingVessel (dispatch, calledFromCron, vesselIdentity) {
  batch(() => {
    dispatch(doNotAnimate(calledFromCron))
    dispatch(removeError())
    dispatch(loadingVessel({
      vesselIdentity,
      calledFromCron
    }))
  })
}

export default showVessel
