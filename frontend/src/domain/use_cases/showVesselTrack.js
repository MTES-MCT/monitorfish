import { getVesselPositionsFromAPI } from '../../api/fetch'
import { addVesselTrackShowed, resetLoadingVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { getVesselFeatureIdFromVessel, Vessel } from '../entities/vessel'
import { doNotAnimate } from '../shared_slices/Map'
import { getTrackDepthError } from '../entities/vesselTrackDepth'
import { convertToUTCFullDay } from '../../utils'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVesselTrack = (vesselIdentity, calledFromCron, vesselTrackDepth) => (dispatch, getState) => {
  const {
    vessels
  } = getState().vessel
  const nextVesselTrackDepthObject = geNextVesselTrackDepthObject(vesselTrackDepth, getState)
  const feature = vessels.find((vessel) => { return Vessel.getVesselId(vesselIdentity) === vessel.vesselId })

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

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
          // coordinates: feature.getGeometry().getCoordinates(),
          coordinates: feature.coordinates,
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

function geNextVesselTrackDepthObject (vesselTrackDepth, getState) {
  let nextVesselTrackDepthObject = vesselTrackDepth || {
    trackDepth: getState().map.defaultVesselTrackDepth,
    beforeDateTime: null,
    afterDateTime: null
  }

  const { afterDateTime, beforeDateTime } = convertToUTCFullDay(nextVesselTrackDepthObject?.afterDateTime, nextVesselTrackDepthObject?.beforeDateTime)
  nextVesselTrackDepthObject = {
    trackDepth: nextVesselTrackDepthObject?.trackDepth,
    afterDateTime,
    beforeDateTime
  }

  return nextVesselTrackDepthObject
}

export default showVesselTrack
