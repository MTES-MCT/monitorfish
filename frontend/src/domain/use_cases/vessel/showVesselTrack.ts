import { transform } from 'ol/proj'

import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map/constants'
import { getVesselCompositeIdentifier } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { addVesselTrackShowed, resetLoadingVessel } from '../../shared_slices/Vessel'

import type { TrackRequest, VesselIdentity } from '../../entities/vessel/types'

/**
 * Show a specified vessel track on map
 */
export const showVesselTrack =
  (vesselIdentity: VesselIdentity, isFromUserAction: boolean, trackRequest: TrackRequest | null, hasZoom?: boolean) =>
  async (dispatch, getState) => {
    try {
      const { defaultVesselTrackDepth } = getState().map
      const nextTrackRequest = getCustomOrDefaultTrackRequest(trackRequest, defaultVesselTrackDepth, true)

      dispatch(doNotAnimate(!isFromUserAction))
      dispatch(removeError())

      const { isTrackDepthModified, positions } = await getVesselPositionsFromAPI(vesselIdentity, nextTrackRequest)
      try {
        throwCustomErrorFromAPIFeedback(positions, isTrackDepthModified, isFromUserAction)
        dispatch(removeError())
      } catch (error) {
        dispatch(setError(error))
      }

      if (!positions?.length) {
        return
      }

      const vesselCompositeIdentifier = getVesselCompositeIdentifier(vesselIdentity)
      const firstPosition = positions[positions.length - 1]
      if (!firstPosition) {
        return
      }

      const coordinates = transform(
        [firstPosition.longitude, firstPosition.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
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
            toShow: true,
            toZoom: hasZoom,
            vesselCompositeIdentifier,
            vesselIdentity
          },
          vesselCompositeIdentifier
        })
      )
    } catch (error) {
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    }
  }
