import { transform } from 'ol/proj'

import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map'
import { getVesselId } from '../../entities/vessel'
import { getCustomOrDefaultTrackRequest, getTrackResponseError } from '../../entities/vesselTrackDepth'
import { removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { addVesselTrackShowed, resetLoadingVessel } from '../../shared_slices/Vessel'

/**
 * Show a specified vessel track on map
 * @function showVesselTrack
 * @param {VesselIdentity} vesselIdentity
 * @param {boolean} calledFromCron
 * @param {TrackRequest | null} trackRequest
 * @param {boolean=} zoom
 */
const showVesselTrack = (vesselIdentity, calledFromCron, trackRequest, zoom) => (dispatch, getState) => {
  const { defaultVesselTrackDepth } = getState().map
  const nextTrackRequest = getCustomOrDefaultTrackRequest(trackRequest, defaultVesselTrackDepth, true)

  dispatch(doNotAnimate(calledFromCron))
  dispatch(removeError())

  getVesselPositionsFromAPI(vesselIdentity, nextTrackRequest)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackResponseError(positions, trackDepthHasBeenModified, calledFromCron, trackRequest)

      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      if (positions?.length) {
        const vesselId = getVesselId(vesselIdentity)
        const firstPosition = positions[positions.length - 1]
        const coordinates = transform(
          [firstPosition.longitude, firstPosition.latitude],
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION,
        )
        const { course } = firstPosition

        dispatch(
          addVesselTrackShowed({
            showedVesselTrack: {
              coordinates,
              course,
              extent: null,
              isDefaultTrackDepth: !trackRequest,
              positions,
              toHide: false,
              vesselId,
              toShow: true,
              vesselIdentity,
              toZoom: zoom,
            },
            vesselId,
          }),
        )
      }
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

export default showVesselTrack
