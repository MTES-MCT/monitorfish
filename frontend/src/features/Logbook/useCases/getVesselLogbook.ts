import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { logbookApi } from '../api'
import { NavigateTo } from '../constants'
import { logbookActions } from '../slice'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 */
export const getVesselLogbook =
  (
    vesselIdentity: Vessel.VesselIdentity | undefined,
    navigateTo: NavigateTo | undefined,
    isFromUserAction: boolean,
    nextTripNumber?: string
  ): MainAppThunk<Promise<Logbook.VesselVoyage | undefined>> =>
  async (dispatch, getState) => {
    if (!vesselIdentity) {
      return undefined
    }

    const {
      fishingActivities: { isLastVoyage, logbookMessages: lastLogbookMessages },
      vessel: { selectedVesselIdentity: currentSelectedVesselIdentity }
    } = getState()

    const nextNavigateTo = navigateTo ?? NavigateTo.LAST
    if (nextNavigateTo === NavigateTo.NEXT && isLastVoyage) {
      return undefined
    }

    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)

    if (isFromUserAction) {
      dispatch(logbookActions.resetNextUpdate())
      dispatch(logbookActions.setIsLoading())
      dispatch(resetDisplayedLogbookMessageOverlays())
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    }

    try {
      const voyage = await dispatch(fetchVesselVoyage(vesselIdentity, nextTripNumber, nextNavigateTo))
      if (!voyage) {
        dispatch(handleNoVoyageFound(isSameVesselAsCurrentlyShowed))

        return undefined
      }

      if (isSameVesselAsCurrentlyShowed && !isFromUserAction && !!lastLogbookMessages && isLastVoyage) {
        if (hasNewFishingActivityUpdates(lastLogbookMessages, voyage)) {
          dispatch(logbookActions.setNextUpdate(voyage.logbookMessages))
        }

        return undefined
      }

      await dispatch(logbookActions.setVoyage({ ...voyage, vesselIdentity }))

      return voyage
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => getVesselLogbook(vesselIdentity, navigateTo, isFromUserAction, nextTripNumber),
          isFromUserAction,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(logbookActions.resetIsLoading())

      return undefined
    }
  }

function fetchVesselVoyage(
  vesselIdentity: Vessel.VesselIdentity,
  tripNumber: string | undefined,
  voyageRequest: NavigateTo
) {
  return async dispatch => {
    const requestArgs = { tripNumber, vesselIdentity, voyageRequest }

    return dispatch(
      logbookApi.endpoints.getVesselLogbook.initiate(requestArgs, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
  }
}

function handleNoVoyageFound(isSameVesselAsCurrentlyShowed: boolean) {
  return async dispatch => {
    dispatch(logbookActions.resetIsLoading())
    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(resetDisplayedLogbookMessageOverlays())
    }
  }
}

function hasNewFishingActivityUpdates(logbookMessages, voyage: Logbook.VesselVoyage): boolean {
  if (!voyage.isLastVoyage) {
    return false
  }

  return (
    (logbookMessages && !logbookMessages.length) ||
    (logbookMessages && voyage.logbookMessages && voyage.logbookMessages.length > logbookMessages.length)
  )
}
