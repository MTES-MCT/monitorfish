import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { Vessel, vesselsAreEquals } from '../entities/vessel'
import { doNotAnimate } from '../shared_slices/Map'
import unselectVessel from './unselectVessel'
import { batch } from 'react-redux'
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
const showVessel = (
  vesselIdentity,
  fromSearch,
  calledFromCron,
  vesselTrackDepth) => (dispatch, getState) => {
  const {
    selectedVessel: alreadySelectedVessel,
    vesselsLayerSource,
    selectedVesselCustomTrackDepth
  } = getState().vessel

  const {
    fishingActivitiesAreShowedOnMap
  } = getState().fishingActivities

  unselectPreviousVessel(calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch)

  const feature = vesselsLayerSource?.getFeatureById(Vessel.getVesselId(vesselIdentity))
  if (feature) {
    feature.set(Vessel.isSelectedProperty, true)
  }
  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    vesselTrackDepth,
    selectedVesselCustomTrackDepth,
    getState().map.defaultVesselTrackDepth)

  if (fishingActivitiesAreShowedOnMap) {
    dispatch(removeFishingActivitiesFromMap())
  }

  getVesselFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(({ vesselAndPositions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        vesselAndPositions.positions,
        trackDepthHasBeenModified,
        calledFromCron,
        vesselTrackDepth)
      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      const vessel = {
        ...vesselAndPositions?.vessel,
        ...vesselIdentity,
        globalRiskFactor: vesselIdentity?.riskFactor,
        riskFactor: vesselAndPositions?.vessel?.riskFactor
      }
      dispatch(setSelectedVessel({
        vessel: vessel,
        positions: vesselAndPositions.positions
      }))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
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

function unselectPreviousVessel (calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch) {
  if (!calledFromCron && vesselIdentity && !vesselsAreEquals(vesselIdentity, alreadySelectedVessel)) {
    dispatch(unselectVessel())
  }
}

export default showVessel
