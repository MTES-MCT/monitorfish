import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { Vessel, vesselsAreEquals } from '../entities/vessel'
import { setUpdatedFromCron } from '../shared_slices/Map'
import unselectVessel from './unselectVessel'
import { batch } from 'react-redux'
import { getTrackDepthError, getVesselTrackDepth } from '../entities/vesselTrackDepth'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {boolean} fromSearch
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVesselTrackAndSidebar = (
  vesselIdentity,
  fromSearch,
  calledFromCron,
  vesselTrackDepth) => (dispatch, getState) => {
  const {
    selectedVessel: alreadySelectedVessel,
    vesselsLayerSource,
    selectedVesselCustomTrackDepth
  } = getState().vessel
  unselectPreviousVessel(calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch)

  const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselId(vesselIdentity))
  if (feature) {
    feature.set(Vessel.isSelectedProperty, true)
  }
  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    calledFromCron,
    vesselTrackDepth,
    selectedVesselCustomTrackDepth,
    getState().map.defaultVesselTrackDepth)

  getVesselFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(vesselAndTrackDepthModified => {
      const error = getTrackDepthError(vesselAndTrackDepthModified, calledFromCron, vesselTrackDepth)
      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      const vessel = {
        ...vesselAndTrackDepthModified?.vessel,
        ...vesselIdentity,
        globalRiskFactor: vesselIdentity?.riskFactor,
        riskFactor: vesselAndTrackDepthModified?.vessel?.riskFactor
      }
      dispatch(setSelectedVessel(vessel))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

function dispatchLoadingVessel (dispatch, calledFromCron, vesselIdentity) {
  batch(() => {
    dispatch(setUpdatedFromCron(calledFromCron))
    dispatch(removeError())
    dispatch(loadingVessel({
      vesselIdentity,
      calledFromCron
    }))
  })
}

function unselectPreviousVessel (calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch) {
  if (!calledFromCron &&
    vesselIdentity &&
    !vesselsAreEquals(vesselIdentity, alreadySelectedVessel)) {
    dispatch(unselectVessel())
  }
}

export default showVesselTrackAndSidebar
