import { addVesselTrackShowed, resetLoadingVessel } from '../../shared_slices/Vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { getVesselCompositeIdentifier } from '../../entities/vessel/vessel'
import { doNotAnimate } from '../../shared_slices/Map'
import { getCustomOrDefaultTrackRequest, getTrackResponseError } from '../../entities/vesselTrackDepth'
import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {TrackRequest | null} trackRequest
 * @param {boolean=} zoom
 */
const showVesselTrack = (vesselIdentity, calledFromCron, trackRequest, zoom) => (dispatch, getState) => {
  const {
    defaultVesselTrackDepth
  } = getState().map
  const nextTrackRequest = getCustomOrDefaultTrackRequest(trackRequest, defaultVesselTrackDepth, true)

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  getVesselPositionsFromAPI(vesselIdentity, nextTrackRequest)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackResponseError(
        positions,
        trackDepthHasBeenModified,
        calledFromCron,
        trackRequest)

      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      if (positions?.length) {
        const vesselMergedIdentifiers = getVesselCompositeIdentifier(vesselIdentity)
        const firstPosition = positions[positions.length - 1]
        const coordinates = transform([firstPosition.longitude, firstPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        const course = firstPosition.course

        dispatch(addVesselTrackShowed({
          vesselMergedIdentifiers: vesselMergedIdentifiers,
          showedVesselTrack: {
            vesselMergedIdentifiers: vesselMergedIdentifiers,
            vesselIdentity: vesselIdentity,
            positions: positions,
            coordinates: coordinates,
            course: course,
            isDefaultTrackDepth: !trackRequest,
            extent: null,
            toZoom: zoom,
            toShow: true,
            toHide: false
          }
        }))
      }
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

export default showVesselTrack
