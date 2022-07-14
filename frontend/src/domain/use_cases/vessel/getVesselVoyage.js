import { removeError, setError } from '../../shared_slices/Global'
import {
  hideFishingActivitiesOnMap,
  loadFishingActivities,
  removeFishingActivitiesFromMap,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap
} from '../../shared_slices/FishingActivities'
import NoLogbookMessagesFoundError from '../../../errors/NoLogbookMessagesFoundError'
import { vesselsAreEquals } from '../../entities/vessel'
import { batch } from 'react-redux'
import { getTrackRequestFromDates } from '../../entities/vesselTrackDepth'
import modifyVesselTrackDepth from './modifyVesselTrackDepth'
import { getVesselVoyageFromAPI } from '../../../api/vessel'

export const NAVIGATE_TO = {
  PREVIOUS: 'PREVIOUS',
  NEXT: 'NEXT',
  LAST: 'LAST'
}

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 * @function getVesselVoyage
 * @param {VesselNS.VesselIdentity} vesselIdentity
 * @param {keyof typeof NAVIGATE_TO} navigateTo
 * @param {boolean} fromCron
 */
const getVesselVoyage = (vesselIdentity, navigateTo, fromCron) => (dispatch, getState) => {
  if (vesselIdentity) {
    const currentSelectedVesselIdentity = getState().vessel.selectedVesselIdentity
    const {
      lastFishingActivities,
      isLastVoyage,
      tripNumber,
      fishingActivitiesAreShowedOnMap
    } = getState().fishingActivities

    const updateVesselTrack = navigateTo && !fromCron
    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)
    navigateTo = navigateTo || NAVIGATE_TO.LAST

    if (navigateTo === NAVIGATE_TO.NEXT && isLastVoyage) {
      console.error('This voyage is the last one.')
      return
    }

    if (!fromCron) {
      dispatch(loadFishingActivities())
    }

    getVesselVoyageFromAPI(vesselIdentity, navigateTo, tripNumber).then(voyage => {
      if (!voyage) {
        batch(() => {
          dispatch(setVoyage(emptyVoyage))
          dispatch(hideFishingActivitiesOnMap())
          dispatch(setError(new NoLogbookMessagesFoundError('Ce navire n\'a pas envoyé de message JPE.')))
        })
        return
      }

      if (isSameVesselAsCurrentlyShowed && fromCron) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
          dispatch(setNextFishingActivities(voyage.logbookMessagesAndAlerts))
          dispatch(removeError())
        }
        return
      }

      if (updateVesselTrack) {
        modifyVesselTrackAndVoyage(voyage, dispatch, vesselIdentity, fishingActivitiesAreShowedOnMap)
        return
      }

      dispatch(setLastVoyage(voyage))
      dispatch(setVoyage(voyage))
      if (fishingActivitiesAreShowedOnMap) {
        dispatch(showFishingActivitiesOnMap(true))
      } else {
        dispatch(hideFishingActivitiesOnMap())
      }

      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setVoyage(emptyVoyage))
        dispatch(setError(error))
      })
    })
  }
}

function modifyVesselTrackAndVoyage (voyage, dispatch, vesselIdentity, fishingActivitiesAreShowedOnMap) {
  const { afterDateTime, beforeDateTime } = getDateRangeMinusFourHoursPlusOneHour(voyage.startDate, voyage.endDate)

  const trackRequest = getTrackRequestFromDates(afterDateTime, beforeDateTime)
  dispatch(modifyVesselTrackDepth(vesselIdentity, trackRequest, true, false)).then(() => {
    dispatch(setVoyage(voyage))
    if (fishingActivitiesAreShowedOnMap) {
      batch(() => {
        dispatch(showFishingActivitiesOnMap(true))
      })
    } else {
      dispatch(removeFishingActivitiesFromMap())
    }
  })
}

function getDateRangeMinusFourHoursPlusOneHour (afterDateTime, beforeDateTime) {
  if (!afterDateTime && !beforeDateTime) {
    return {
      afterDateTime: null,
      beforeDateTime: null
    }
  }

  afterDateTime = new Date(afterDateTime)
  const fourHours = 4
  afterDateTime.setTime(afterDateTime.getTime() - (fourHours * 60 * 60 * 1000))

  beforeDateTime = new Date(beforeDateTime)
  const oneHour = 1
  beforeDateTime.setTime(beforeDateTime.getTime() + (oneHour * 60 * 60 * 1000))

  return {
    afterDateTime,
    beforeDateTime
  }
}

function gotNewFishingActivitiesWithMoreMessagesOrAlerts (lastFishingActivities, voyage) {
  return (lastFishingActivities.logbookMessages && !lastFishingActivities.logbookMessages.length) ||
    (lastFishingActivities.alerts && voyage.logbookMessagesAndAlerts.alerts &&
      voyage.logbookMessagesAndAlerts.alerts.length > lastFishingActivities.alerts.length) ||
    (lastFishingActivities.logbookMessages && voyage.logbookMessagesAndAlerts.logbookMessages &&
      voyage.logbookMessagesAndAlerts.logbookMessages.length > lastFishingActivities.logbookMessages.length)
}

const emptyVoyage = {
  logbookMessagesAndAlerts: {
    logbookMessages: [],
    alerts: []
  }
}

export default getVesselVoyage
