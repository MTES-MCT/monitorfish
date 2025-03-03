import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { saveVoyage } from '@features/Logbook/useCases/saveVoyage'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { customDayjs, Level } from '@mtes-mct/monitor-ui'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { getTrackRequestFromDates, getTrackRequestFromTrackDepth } from '../../Vessel/types/vesselTrackDepth'
import { updateSelectedVesselTrack } from '../../Vessel/useCases/updateSelectedVesselTrack'
import { logbookApi, logbookLightApi } from '../api'
import { NavigateTo } from '../constants'
import { logbookActions } from '../slice'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 */
export const getVesselLogbook =
  (isInLightMode: boolean) =>
  (
    vesselIdentity: Vessel.VesselIdentity | undefined,
    navigateTo: NavigateTo | undefined,
    isFromUserAction: boolean,
    nextTripNumber?: string
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (!vesselIdentity) {
      return
    }

    const {
      fishingActivities: { isLastVoyage, lastFishingActivities, tripNumber },
      map: { defaultVesselTrackDepth },
      vessel: { selectedVesselIdentity: currentSelectedVesselIdentity }
    } = getState()

    const nextNavigateTo = navigateTo ?? NavigateTo.LAST
    if (nextNavigateTo === NavigateTo.NEXT && isLastVoyage) {
      return
    }

    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)
    const updateVesselTrack = navigateTo && isFromUserAction

    if (isFromUserAction) {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
      dispatch(logbookActions.setIsLoading())
      dispatch(resetDisplayedLogbookMessageOverlays())
    }

    try {
      const voyage = await dispatch(
        fetchVesselVoyage(vesselIdentity, nextTripNumber ?? tripNumber, isInLightMode, nextNavigateTo)
      )
      if (!voyage) {
        dispatch(handleNoVoyageFound())

        return
      }

      if (isSameVesselAsCurrentlyShowed && !isFromUserAction) {
        if (hasNewFishingActivityUpdates(lastFishingActivities, voyage)) {
          dispatch(logbookActions.setNextUpdate(voyage.logbookMessagesAndAlerts))
          dispatch(removeError())
        }

        return
      }

      const voyageWithVesselIdentity = {
        ...voyage,
        vesselIdentity
      }
      if (updateVesselTrack) {
        dispatch(displayVesselTrack(voyageWithVesselIdentity, vesselIdentity, defaultVesselTrackDepth))
      }

      await dispatch(saveVoyage(voyageWithVesselIdentity))
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => getVesselLogbook(isInLightMode)(vesselIdentity, navigateTo, isFromUserAction, nextTripNumber),
          isFromUserAction,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(logbookActions.resetIsLoading())
    }
  }

function fetchVesselVoyage(
  vesselIdentity: Vessel.VesselIdentity,
  tripNumber: string | null,
  isInLightMode: boolean,
  voyageRequest: NavigateTo
) {
  return async dispatch => {
    const requestArgs = { tripNumber: tripNumber ?? undefined, vesselIdentity, voyageRequest }
    const initiateGetVesselLogbook = isInLightMode
      ? logbookLightApi.endpoints.getVesselLogbook.initiate
      : logbookApi.endpoints.getVesselLogbook.initiate

    return dispatch(initiateGetVesselLogbook(requestArgs)).unwrap()
  }
}

function handleNoVoyageFound() {
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
  }
}

function displayVesselTrack(
  voyage: Logbook.VesselVoyage,
  vesselIdentity: Vessel.VesselIdentity,
  defaultVesselTrackDepth: SelectableVesselTrackDepth
) {
  return async dispatch => {
    if (!voyage.startDate && !voyage.endDate) {
      return
    }

    const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)
    const trackRequest = voyage.isLastVoyage
      ? getTrackRequestFromTrackDepth(defaultVesselTrackDepth)
      : getTrackRequestFromDates(afterDateTime, beforeDateTime)

    dispatch(updateSelectedVesselTrack(vesselIdentity, trackRequest, true))
  }
}

function getDateRangeMinusFourHoursPlusOneHour(afterDateTime, beforeDateTime) {
  const nextAfterDateTime = customDayjs(afterDateTime).subtract(4, 'hours')
  const nextBeforeDateTime = customDayjs(beforeDateTime).add(1, 'hour')

  return {
    afterDateTime: nextAfterDateTime.toDate(),
    beforeDateTime: nextBeforeDateTime.toDate()
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
