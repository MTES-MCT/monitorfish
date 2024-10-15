import { getVesselFromAPI } from '@api/vessel'
import { logbookActions } from '@features/Logbook/slice'
import { loadingVessel, resetLoadingVessel, setSelectedVessel, vesselSelectors } from '@features/Vessel/slice'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { captureMessage } from '@sentry/react'

import { Vessel } from '../../entities/vessel/vessel'
import { getCustomOrDefaultTrackRequest, throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { displayedComponentActions } from '../../shared_slices/DisplayedComponent'
import { displayedErrorActions } from '../../shared_slices/DisplayedError'
import { addSearchedVessel, removeError, setError } from '../../shared_slices/Global'
import { doNotAnimate } from '../../shared_slices/Map'
import { displayOrLogError } from '../error/displayOrLogError'

import type { VesselIdentity } from '../../entities/vessel/types'
import type { Vessel as VesselTypes } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const showVessel =
  (vesselIdentity: VesselIdentity, isFromSearch: boolean, isFromUserAction: boolean): MainAppThunk<Promise<void>> =>
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

      const vesselFeatureId = Vessel.getVesselFeatureId(vesselIdentity)
      const selectedVesselLastPosition: VesselTypes.VesselEnhancedObject | undefined = vessels.find(
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

      const { isTrackDepthModified, vesselAndPositions } = await getVesselFromAPI(vesselIdentity, nextTrackRequest)
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
        ...selectedVesselLastPosition,
        // If we found a vessel from the vessels table, we enrich the vessel
        ...vesselAndPositions?.vessel
      }

      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
      dispatch(
        setSelectedVessel({
          positions: vesselAndPositions.positions,
          vessel: selectedVessel as VesselTypes.SelectedVessel
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

function dispatchLoadingVessel(dispatch, isFromUserAction: boolean, vesselIdentity: VesselIdentity) {
  dispatch(doNotAnimate(!isFromUserAction))
  dispatch(removeError())
  dispatch(
    loadingVessel({
      calledFromCron: !isFromUserAction,
      vesselIdentity
    })
  )
}
