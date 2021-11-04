import { getVesselPositionsFromAPI } from '../../api/fetch'
import { addVesselTrackShowed, resetLoadingVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { getVesselFeatureIdFromVessel, Vessel } from '../entities/vessel'
import { doNotAnimate } from '../shared_slices/Map'
import { getTrackDepthError } from '../entities/vesselTrackDepth'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVesselTrack = (
  vesselIdentity,
  calledFromCron,
  vesselTrackDepth) => (dispatch, getState) => {
  const {
    vesselsLayerSource
  } = getState().vessel

  const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselId(vesselIdentity))
  if (feature) {
    feature.set(Vessel.isSelectedProperty, true)
  }
  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  const nextVesselTrackDepthObject = vesselTrackDepth || {
    trackDepth: getState().map.defaultVesselTrackDepth,
    beforeDateTime: null,
    afterDateTime: null
  }

  getVesselPositionsFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        positions,
        trackDepthHasBeenModified,
        calledFromCron,
        vesselTrackDepth)

      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      const identity = getVesselFeatureIdFromVessel(vesselIdentity)
      dispatch(addVesselTrackShowed({
        identity: identity,
        showedVesselTrack: {
          identity: identity,
          vessel: vesselIdentity,
          coordinates: feature.getGeometry().getCoordinates(),
          positions: positions,
          trackDepth: nextVesselTrackDepthObject,
          toShow: true,
          toHide: false
        }
      }))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

export default showVesselTrack
