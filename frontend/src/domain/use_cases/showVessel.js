import { batch } from 'react-redux'
import { getVesselFromAPI } from '../../api/fetch'
import { Vessel } from '../entities/vessel'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { doNotAnimate } from '../shared_slices/Map'
import { getTrackDepthError, getVesselTrackDepth } from '../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../shared_slices/FishingActivities'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 * @function showVessel
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {boolean} fromSearch
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVessel = (vesselIdentity, fromSearch, calledFromCron, vesselTrackDepth) => (dispatch, getState) => {
  const { vessel, fishingActivities, map } = getState()
  const {
    selectedVesselCustomTrackDepth,
    vessels
  } = vessel

  const {
    fishingActivitiesAreShowedOnMap
  } = fishingActivities

  const lastPositionVessel = vessels.find(vessel => vessel.vesselId === Vessel.getVesselId(vesselIdentity))

  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    vesselTrackDepth,
    selectedVesselCustomTrackDepth,
    map.defaultVesselTrackDepth)

  if (fishingActivitiesAreShowedOnMap && !calledFromCron) {
    dispatch(removeFishingActivitiesFromMap())
  }

  getVesselFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(({ vesselAndPositions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        vesselAndPositions.positions,
        trackDepthHasBeenModified,
        calledFromCron,
        vesselTrackDepth)

      const selectedVessel = {
        ...lastPositionVessel?.vesselProperties,
        ...vesselAndPositions?.vessel,
        ...vesselIdentity,
        globalRiskFactor: vesselIdentity?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor
      }
      console.log(selectedVessel)

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
