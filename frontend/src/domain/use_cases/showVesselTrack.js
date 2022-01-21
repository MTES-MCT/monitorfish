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
const showVesselTrack = (vesselFeature, calledFromCron, vesselTrackDepth) => (dispatch, getState) => {
  const {
    vessel: {
      vessels
    }, map: {
      defaultVesselTrackDepth
    }
  } = getState()
  const nextVesselTrackDepthObject = getNextVesselTrackDepthObject(vesselTrackDepth, defaultVesselTrackDepth)
  const feature = vessels.find((vessel) => {
    return (vesselFeature.vesselId ? (vesselFeature.vesselId === vessel.vesselId) : Vessel.getVesselId(vesselFeature?.vesselProperties) === vessel.vesselId)
  })

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  getVesselPositionsFromAPI(vesselFeature.vesselProperties, nextVesselTrackDepthObject)
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
      const identity = getVesselFeatureIdFromVessel(vesselFeature.vesselProperties)
      dispatch(addVesselTrackShowed({
        identity: identity,
        showedVesselTrack: {
          identity: identity,
          vessel: vesselFeature.vesselProperties,
          coordinates: feature.coordinates,
          course: feature.course,
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
