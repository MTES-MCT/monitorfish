import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { doNotAnimate } from '@features/Map/slice'
import { addVesselTrackShowed, resetLoadingVessel } from '@features/Vessel/slice'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'
import { transform } from 'ol/proj'

import { displayBannerWarningFromAPIFeedback } from './displayBannerWarningFromAPIFeedback'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { getCustomOrDefaultTrackRequest } from '../types/vesselTrackDepth'

import type { TrackRequest } from '@features/Vessel/types/types'
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
        dispatch(
          addMainWindowBanner({
            children: "Nous n'avons trouvé aucune position pour ce navire",
            closingDelay: 3000,
            isClosable: true,
            isFixed: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

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
