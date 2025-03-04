import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { saveVoyage } from '@features/Logbook/useCases/saveVoyage'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Level } from '@mtes-mct/monitor-ui'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError } from '../../../domain/shared_slices/Global'
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
      fishingActivities: { isLastVoyage, lastFishingActivities, tripNumber },
      vessel: { selectedVesselIdentity: currentSelectedVesselIdentity }
    } = getState()

    const nextNavigateTo = navigateTo ?? NavigateTo.LAST
    if (nextNavigateTo === NavigateTo.NEXT && isLastVoyage) {
      return undefined
    }

    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)

    if (isFromUserAction) {
      dispatch(logbookActions.resetNextUpdate())
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
      dispatch(logbookActions.setIsLoading())
      dispatch(resetDisplayedLogbookMessageOverlays())
    }

    try {
      const voyage = await dispatch(fetchVesselVoyage(vesselIdentity, nextTripNumber ?? tripNumber, nextNavigateTo))
      if (!voyage) {
        dispatch(handleNoVoyageFound(isSameVesselAsCurrentlyShowed))

        return undefined
      }

      if (isSameVesselAsCurrentlyShowed && !isFromUserAction && isLastVoyage) {
        if (hasNewFishingActivityUpdates(lastFishingActivities, voyage)) {
          dispatch(logbookActions.setNextUpdate(voyage.logbookMessagesAndAlerts))
          dispatch(removeError())
        }

        return undefined
      }

      await dispatch(saveVoyage({ ...voyage, vesselIdentity }))

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
  tripNumber: string | null,
  voyageRequest: NavigateTo
) {
  return async dispatch => {
    const requestArgs = { tripNumber: tripNumber ?? undefined, vesselIdentity, voyageRequest }

    return dispatch(
      logbookApi.endpoints.getVesselLogbook.initiate(requestArgs, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
  }
}

function handleNoVoyageFound(isSameVesselAsCurrentlyShowed: boolean) {
  return async dispatch => {
    dispatch(
      addMainWindowBanner({
        children: "Ce navire n'a pas envoyé de message JPE.",
        closingDelay: 2000,
        isClosable: true,
        isFixed: true,
        level: Level.WARNING,
        withAutomaticClosing: true
      })
    )
    dispatch(logbookActions.resetIsLoading())
    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(resetDisplayedLogbookMessageOverlays())
    }
  }
}

function hasNewFishingActivityUpdates(lastFishingActivities, voyage: Logbook.VesselVoyage): boolean {
  if (!voyage.isLastVoyage) {
    return false
  }

  return (
    (lastFishingActivities.logbookMessages && !lastFishingActivities.logbookMessages.length) ||
    (lastFishingActivities.alerts &&
      voyage.logbookMessagesAndAlerts.alerts &&
      voyage.logbookMessagesAndAlerts.alerts.length > lastFishingActivities.alerts.length) ||
    (lastFishingActivities.logbookMessages &&
      voyage.logbookMessagesAndAlerts.logbookMessages &&
      voyage.logbookMessagesAndAlerts.logbookMessages.length > lastFishingActivities.logbookMessages.length)
  )
}
