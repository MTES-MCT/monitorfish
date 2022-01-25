import { getVesselPositionsFromAPI } from '../../api/fetch'
import { addVesselTrackShowed, resetLoadingVessel } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { getVesselFeatureIdFromVessel } from '../entities/vessel'
import { doNotAnimate } from '../shared_slices/Map'
import { getTrackDepthError } from '../entities/vesselTrackDepth'
import { convertToUTCFullDay } from '../../utils'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {Vessel} clickedVessel
 * @param {boolean} calledFromCron
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const showVesselTrack = (clickedVessel, calledFromCron, vesselTrackDepth) => (dispatch, getState) => {
  const {
    map: {
      defaultVesselTrackDepth
    }
  } = getState()
  const nextVesselTrackDepthObject = getNextVesselTrackDepthObject(vesselTrackDepth, defaultVesselTrackDepth)

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  getVesselPositionsFromAPI(clickedVessel.vesselProperties, nextVesselTrackDepthObject)
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
      const identity = getVesselFeatureIdFromVessel(clickedVessel.vesselProperties)
      dispatch(addVesselTrackShowed({
        identity: identity,
        showedVesselTrack: {
          identity: identity,
          vessel: clickedVessel,
          coordinates: clickedVessel.coordinates,
          course: clickedVessel.vesselProperties.course,
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

function getNextVesselTrackDepthObject (vesselTrackDepth, trackDepth) {
  let nextVesselTrackDepthObject = vesselTrackDepth || {
    trackDepth,
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
