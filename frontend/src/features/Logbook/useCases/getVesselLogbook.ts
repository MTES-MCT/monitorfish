import { customDayjs } from '@mtes-mct/monitor-ui'

import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { getTrackRequestFromDates } from '../../../domain/entities/vesselTrackDepth'
import { setDisplayedErrors } from '../../../domain/shared_slices/DisplayedError'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { updateSelectedVesselTrackRequest } from '../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import NoLogbookMessagesFoundError from '../../../errors/NoLogbookMessagesFoundError'
import { getVesselLogbookFromAPI } from '../api'
import { NavigateTo } from '../constants'
import { logbookActions } from '../slice'

import type { VesselIdentity } from '../../../domain/entities/vessel/types'

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 */
export const getVesselLogbook =
  (
    vesselIdentity: VesselIdentity | null,
    navigateTo: NavigateTo | undefined,
    isFromUserAction: boolean,
    nextTripNumber?: string
  ) =>
  async (dispatch, getState) => {
    if (!vesselIdentity) {
      return
    }

    const currentSelectedVesselIdentity = getState().vessel.selectedVesselIdentity
    const { areFishingActivitiesShowedOnMap, isLastVoyage, lastFishingActivities, tripNumber } =
      getState().fishingActivities

    const updateVesselTrack = navigateTo && isFromUserAction
    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)
    const nextNavigateTo = navigateTo || NavigateTo.LAST

    if (nextNavigateTo === NavigateTo.NEXT && isLastVoyage) {
      return
    }

    if (isFromUserAction) {
      dispatch(setDisplayedErrors({ vesselSidebarError: null }))
      dispatch(logbookActions.setIsLoading())
    }

    try {
      const voyage = await getVesselLogbookFromAPI(vesselIdentity, nextNavigateTo, nextTripNumber || tripNumber)
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
        modifyVesselTrackAndVoyage(voyageWithVesselIdentity, dispatch, vesselIdentity, areFishingActivitiesShowedOnMap)

        return
      }

      dispatch(logbookActions.setLastVoyage(voyageWithVesselIdentity))
      dispatch(logbookActions.setVoyage(voyageWithVesselIdentity))
      if (areFishingActivitiesShowedOnMap) {
        dispatch(logbookActions.showAllOnMap())
      } else {
        dispatch(logbookActions.showAllOnMap())
      }

      dispatch(removeError())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          {
            func: getVesselLogbook,
            parameters: [vesselIdentity, navigateTo, isFromUserAction]
          },
          isFromUserAction,
          'vesselSidebarError'
        )
      )
      dispatch(logbookActions.resetIsLoading())
    }
  }

function modifyVesselTrackAndVoyage(voyage, dispatch, vesselIdentity, areFishingActivitiesShowedOnMap) {
  if (!voyage.startDate && !voyage.endDate) {
    return
  }

  const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)

  const trackRequest = getTrackRequestFromDates(afterDateTime, beforeDateTime)
  dispatch(updateSelectedVesselTrackRequest(vesselIdentity, trackRequest, true)).then(() => {
    dispatch(logbookActions.setVoyage(voyage))
    if (areFishingActivitiesShowedOnMap) {
      dispatch(logbookActions.showAllOnMap())
    } else {
      dispatch(logbookActions.removeAllFromMap())
    }
  })
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
