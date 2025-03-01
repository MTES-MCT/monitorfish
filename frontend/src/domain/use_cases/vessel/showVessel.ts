import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { logbookActions } from '@features/Logbook/slice'
import { doNotAnimate } from '@features/Map/slice'
import { loadingVessel, resetLoadingVessel, setSelectedVessel, vesselSelectors } from '@features/Vessel/slice'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { captureMessage } from '@sentry/react'
import { omit } from 'lodash-es'

import { VesselFeature } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { displayedComponentActions } from '../../shared_slices/DisplayedComponent'
import { displayedErrorActions } from '../../shared_slices/DisplayedError'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { displayOrLogError } from '../error/displayOrLogError'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const showVessel =
  (
    vesselIdentity: Vessel.VesselIdentity,
    isFromSearch: boolean,
    isFromUserAction: boolean
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    try {
      const { fishingActivities, map, vessel } = getState()
      const { selectedVesselTrackRequest } = vessel
      const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
      const { defaultVesselTrackDepth } = map
      const { areFishingActivitiesShowedOnMap } = fishingActivities
      // TODO How to handle both the control unit dialog and the vessel sidebar ?
      dispatch(
        displayedComponentActions.setDisplayedComponents({
          isControlUnitDialogDisplayed: false,
          isControlUnitListDialogDisplayed: false
        })
      )

      const vesselFeatureId = VesselFeature.getVesselFeatureId(vesselIdentity)
      const selectedVesselLastPosition: Vessel.VesselLastPosition | undefined = vessels.find(
        lastPosition => lastPosition.vesselFeatureId === vesselFeatureId
      )

      dispatchLoadingVessel(dispatch, isFromUserAction, vesselIdentity)
      const nextTrackRequest = getCustomOrDefaultTrackRequest(
        selectedVesselTrackRequest,
        defaultVesselTrackDepth,
        false
      )
      if (areFishingActivitiesShowedOnMap && isFromUserAction) {
        dispatch(logbookActions.removeAllFromMap())
      }

      if (isFromSearch) {
        dispatch(addSearchedVessel(vesselIdentity))
      }

      const { isTrackDepthModified, vesselAndPositions } = await dispatch(
        vesselApi.endpoints.getVesselAndPositions.initiate(
          { trackRequest: nextTrackRequest, vesselIdentity },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()

      try {
        throwCustomErrorFromAPIFeedback(vesselAndPositions.positions, isTrackDepthModified, isFromUserAction)
      } catch (error) {
        dispatch(setError(error))
      }

      if (!selectedVesselLastPosition && !vesselAndPositions?.vessel) {
        captureMessage('Aucune dernière position trouvée pour un navire inconnu dans la table navires.', {
          extra: {
            vesselFeatureId,
            vesselIdentity
          }
        })
      }

      const selectedVessel = {
        // As a safeguard, the VesselIdentity is added as a base object (in case no last position and no vessel are found)
        ...vesselIdentity,
        // If we found a last position, we enrich the vessel
        ...omit(selectedVesselLastPosition, ['riskFactor']),
        // If we found a vessel from the vessels table, we enrich the vessel
        ...vesselAndPositions?.vessel
      }

      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
      dispatch(
        setSelectedVessel({
          positions: vesselAndPositions.positions,
          vessel: selectedVessel as Vessel.SelectedVessel
        })
      )
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => showVessel(vesselIdentity, isFromSearch, isFromUserAction),
          isFromUserAction,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(resetLoadingVessel())
    }
  }

function dispatchLoadingVessel(dispatch, isFromUserAction: boolean, vesselIdentity: Vessel.VesselIdentity) {
  dispatch(doNotAnimate(!isFromUserAction))
  dispatch(removeError())
  dispatch(
    loadingVessel({
      calledFromCron: !isFromUserAction,
      vesselIdentity
    })
  )
}
