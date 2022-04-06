import { addVesselTrackShowed, resetLoadingVessel } from '../../shared_slices/Vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { getVesselId } from '../../entities/vessel'
import { doNotAnimate } from '../../shared_slices/Map'
import { getTrackDepthError } from '../../entities/vesselTrackDepth'
import { convertToUTCFullDay } from '../../../utils'
import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {VesselTrackDepthRequest | null} vesselTrackDepthRequest
 * @param {boolean=} zoom
 */
const showVesselTrack = (vesselIdentity, calledFromCron, vesselTrackDepthRequest, zoom) => (dispatch, getState) => {
  const {
    defaultVesselTrackDepth
  } = getState().map
  const {
    nextVesselTrackDepthRequest,
    isDefaultTrackDepth
  } = getNextVesselTrackDepthObject(vesselTrackDepthRequest, defaultVesselTrackDepth)

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  getVesselPositionsFromAPI(vesselIdentity, nextVesselTrackDepthRequest)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        positions,
        trackDepthHasBeenModified,
        calledFromCron,
        vesselTrackDepthRequest)

      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      const vesselId = getVesselId(vesselIdentity)
      const firstPosition = positions[positions.length - 1]
      const coordinates = transform([firstPosition.longitude, firstPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      const course = firstPosition.course

      dispatch(addVesselTrackShowed({
        vesselId: vesselId,
        showedVesselTrack: {
          vesselId: vesselId,
          vesselIdentity: vesselIdentity,
          positions: positions,
          coordinates: coordinates,
          course: course,
          trackDepth: nextVesselTrackDepthRequest,
          isDefaultTrackDepth: isDefaultTrackDepth,
          extent: null,
          toZoom: zoom,
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

export function getNextVesselTrackDepthObject (vesselTrackDepthRequest, defaultTrackDepth) {
  const isDefaultTrackDepth = !vesselTrackDepthRequest
  let nextVesselTrackDepthRequest = vesselTrackDepthRequest || {
    trackDepth: defaultTrackDepth,
    beforeDateTime: null,
    afterDateTime: null
  }

  const { afterDateTime, beforeDateTime } = convertToUTCFullDay(nextVesselTrackDepthRequest?.afterDateTime, nextVesselTrackDepthRequest?.beforeDateTime)
  nextVesselTrackDepthRequest = {
    trackDepth: nextVesselTrackDepthRequest?.trackDepth,
    afterDateTime,
    beforeDateTime
  }

  return {
    nextVesselTrackDepthRequest,
    isDefaultTrackDepth
  }
}

export default showVesselTrack
