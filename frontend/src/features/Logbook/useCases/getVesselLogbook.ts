import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { getTrackRequestFromDates, getTrackRequestFromTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { updateSelectedVesselTrackRequest } from '../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import { NoLogbookMessagesFoundError } from '../../../errors/NoLogbookMessagesFoundError'
import { logbookApi, logbookLightApi } from '../api'
import { NavigateTo } from '../constants'
import { logbookActions } from '../slice'

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

    const currentSelectedVesselIdentity = getState().vessel.selectedVesselIdentity
    const { defaultVesselTrackDepth } = getState().map
    const { areFishingActivitiesShowedOnMap, isLastVoyage, lastFishingActivities, tripNumber } =
      getState().fishingActivities

    const updateVesselTrack = navigateTo && isFromUserAction
    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)
    const nextNavigateTo = navigateTo ?? NavigateTo.LAST

    if (nextNavigateTo === NavigateTo.NEXT && isLastVoyage) {
      return
    }

    if (isFromUserAction) {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
      dispatch(logbookActions.setIsLoading())
    }

    try {
      const requestArgs = {
        tripNumber: nextTripNumber ?? tripNumber ?? undefined,
        vesselIdentity,
        voyageRequest: nextNavigateTo
      }
      const initiateGetVesselLogbook = isInLightMode
        ? logbookLightApi.endpoints.getVesselLogbook.initiate
        : logbookApi.endpoints.getVesselLogbook.initiate

      const voyage = await dispatch(initiateGetVesselLogbook(requestArgs)).unwrap()
      if (!voyage) {
        dispatch(logbookActions.init(vesselIdentity))
        dispatch(setError(new NoLogbookMessagesFoundError("Ce navire n'a pas envoyé de message JPE.")))

        return
      }

      if (isSameVesselAsCurrentlyShowed && !isFromUserAction) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
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
        await modifyVesselTrackAndVoyage(
          voyageWithVesselIdentity,
          dispatch,
          vesselIdentity,
          areFishingActivitiesShowedOnMap,
          defaultVesselTrackDepth
        )

        return
      }

      dispatch(logbookActions.setLastVoyage(voyageWithVesselIdentity))
      dispatch(logbookActions.setVoyage(voyageWithVesselIdentity))
      if (areFishingActivitiesShowedOnMap) {
        dispatch(logbookActions.showAllOnMap())
      } else {
        dispatch(logbookActions.hideAllOnMap())
      }

      dispatch(removeError())
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

async function modifyVesselTrackAndVoyage(
  voyage,
  dispatch,
  vesselIdentity,
  areFishingActivitiesShowedOnMap,
  defaultVesselTrackDepth
) {
  if (!voyage.startDate && !voyage.endDate) {
    return
  }

  const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)
  const trackRequest = voyage.isLastVoyage
    ? getTrackRequestFromTrackDepth(defaultVesselTrackDepth)
    : getTrackRequestFromDates(afterDateTime, beforeDateTime)

  await dispatch(updateSelectedVesselTrackRequest(vesselIdentity, trackRequest, true))
  await dispatch(logbookActions.setVoyage(voyage))

  if (areFishingActivitiesShowedOnMap) {
    dispatch(logbookActions.showAllOnMap())
  } else {
    dispatch(logbookActions.removeAllFromMap())
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

function gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage) {
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
