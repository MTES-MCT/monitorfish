import { batch } from 'react-redux'
import { getVesselFromAPI } from '../../api/fetch'
import { getOnlyVesselIdentityProperties, Vessel } from '../entities/vessel'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../shared_slices/Vessel'
import { addSearchedVessel, removeError, setError } from '../shared_slices/Global'
import { doNotAnimate } from '../shared_slices/Map'
import { getTrackDepthError } from '../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../shared_slices/FishingActivities'
import { getNextVesselTrackDepthObject } from './showVesselTrack'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 * @function showVessel
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {boolean} fromSearch
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVessel = (vesselIdentity, fromSearch, calledFromCron, vesselTrackDepth) => (dispatch, getState) => {
  vesselIdentity = getOnlyVesselIdentityProperties(vesselIdentity)

  const { vessel, fishingActivities, map } = getState()
  const {
    vessels
  } = vessel
  const {
    defaultVesselTrackDepth
  } = map
  const {
    fishingActivitiesAreShowedOnMap
  } = fishingActivities

  const lastPositionVessel = vessels.find(vessel => vessel.vesselId === Vessel.getVesselId(vesselIdentity))

  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextVesselTrackDepthObject = getNextVesselTrackDepthObject(vesselTrackDepth, defaultVesselTrackDepth)
  if (fishingActivitiesAreShowedOnMap && !calledFromCron) {
    dispatch(removeFishingActivitiesFromMap())
  }

  if (fromSearch) {
    dispatch(addSearchedVessel(vesselIdentity))
  }

  getVesselFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(({ vesselAndPositions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        vesselAndPositions.positions,
        trackDepthHasBeenModified,
        calledFromCron,
        vesselTrackDepth)

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

        dispatch(setSelectedVessel({
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
