import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { doNotAnimate } from '@features/Map/slice'
import { addVesselTrackShowed, resetLoadingVessel } from '@features/Vessel/slice'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { vesselApi } from '@features/Vessel/vesselApi'
import { transform } from 'ol/proj'

import { displayBannerWarningFromAPIFeedback } from './displayBannerWarningFromAPIFeedback'
import { getCustomOrDefaultTrackRequest } from '../../entities/vesselTrackDepth'
import { removeError, setError } from '../../shared_slices/Global'

import type { TrackRequest } from '../../entities/vessel/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Show a specified vessel track on map
 */
export const showVesselTrack =
  (
    vesselIdentity: Vessel.VesselIdentity,
    isFromUserAction: boolean,
    trackRequest: TrackRequest | null,
    hasZoom: boolean = false
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const { defaultVesselTrackDepth } = getState().map
      const nextTrackRequest = getCustomOrDefaultTrackRequest(trackRequest, defaultVesselTrackDepth, true)

      dispatch(doNotAnimate(!isFromUserAction))
      dispatch(removeError())

      const { isTrackDepthModified, positions } = await dispatch(
        vesselApi.endpoints.getVesselPositions.initiate(
          { trackRequest: nextTrackRequest, vesselIdentity },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()
      dispatch(displayBannerWarningFromAPIFeedback(positions, isTrackDepthModified, false))

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
