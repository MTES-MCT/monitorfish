import { customDayjs } from '@mtes-mct/monitor-ui'

import { updateSelectedVesselTrackRequest } from './updateSelectedVesselTrackRequest'
import { getVesselLogbookFromAPI } from '../../../api/vessel'
import NoLogbookMessagesFoundError from '../../../errors/NoLogbookMessagesFoundError'
import { vesselsAreEquals } from '../../entities/vessel/vessel'
import { getTrackRequestFromDates } from '../../entities/vesselTrackDepth'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import {
  hideFishingActivitiesOnMap,
  loadFishingActivities,
  removeFishingActivitiesFromMap,
  resetFishingActivities,
  resetLoadFishingActivities,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap
} from '../../shared_slices/FishingActivities'
import { removeError, setError } from '../../shared_slices/Global'
import { displayOrLogError } from '../error/displayOrLogError'

import type { VesselIdentity } from '../../entities/vessel/types'

export enum NavigateTo {
  LAST = 'LAST',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS'
}

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 */
export const getVesselLogbook =
  (vesselIdentity: VesselIdentity | null, navigateTo: NavigateTo | undefined, isFromUserAction: boolean) =>
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
      dispatch(loadFishingActivities())
    }

    try {
      const voyage = await getVesselLogbookFromAPI(vesselIdentity, nextNavigateTo, tripNumber)
      if (!voyage) {
        dispatch(resetFishingActivities(vesselIdentity))
        dispatch(setError(new NoLogbookMessagesFoundError("Ce navire n'a pas envoyé de message JPE.")))

        return
      }

      if (isSameVesselAsCurrentlyShowed && !isFromUserAction) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
          dispatch(setNextFishingActivities(voyage.logbookMessagesAndAlerts))
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

      dispatch(setLastVoyage(voyageWithVesselIdentity))
      dispatch(setVoyage(voyageWithVesselIdentity))
      if (areFishingActivitiesShowedOnMap) {
        dispatch(showFishingActivitiesOnMap())
      } else {
        dispatch(hideFishingActivitiesOnMap())
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
      dispatch(resetLoadFishingActivities())
    }
  }

function modifyVesselTrackAndVoyage(voyage, dispatch, vesselIdentity, areFishingActivitiesShowedOnMap) {
  if (!voyage.startDate && !voyage.endDate) {
    return
  }

  const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)

  const trackRequest = getTrackRequestFromDates(afterDateTime, beforeDateTime)
  dispatch(updateSelectedVesselTrackRequest(vesselIdentity, trackRequest, true)).then(() => {
    dispatch(setVoyage(voyage))
    if (areFishingActivitiesShowedOnMap) {
      dispatch(showFishingActivitiesOnMap())
    } else {
      dispatch(removeFishingActivitiesFromMap())
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
