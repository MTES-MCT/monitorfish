import { getVesselVoyageFromAPI } from '../../api/fetch'
import { removeError, setError } from '../shared_slices/Global'
import {
  hideFishingActivitiesOnMap,
  loadFishingActivities,
  redrawFishingActivitiesOnMap,
  removeFishingActivitiesFromMap,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap
} from '../shared_slices/FishingActivities'
import NoERSMessagesFoundError from '../../errors/NoERSMessagesFoundError'
import { vesselsAreEquals } from '../entities/vessel'
import { batch } from 'react-redux'
import { setSelectedVesselCustomTrackDepth } from '../shared_slices/Vessel'
import { VesselTrackDepth } from '../entities/vesselTrackDepth'
import modifyVesselTrackDepth from './modifyVesselTrackDepth'

export const NAVIGATE_TO = {
  PREVIOUS: 'PREVIOUS',
  NEXT: 'NEXT',
  LAST: 'LAST'
}

/**
 * Get the vessel fishing voyage and update the vessel positions track when navigating in the trips
 * @function getVesselVoyage
 * @param {VesselIdentity} vesselIdentity
 * @param {string<NAVIGATE_TO>} navigateTo
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
    const isFirstTimeVesselVoyageIsShowed = !navigateTo && !fromCron
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
          dispatch(setError(new NoERSMessagesFoundError('Ce navire n\'a pas envoyé de message JPE.')))
        })
        return
      }

      if (isSameVesselAsCurrentlyShowed && fromCron) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
          dispatch(setNextFishingActivities(voyage.ersMessagesAndAlerts))
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
      if (fishingActivitiesAreShowedOnMap || isFirstTimeVesselVoyageIsShowed) {
        dispatch(showFishingActivitiesOnMap())
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
  const { afterDateTime, beforeDateTime } = getDateRangePlusOneDay(voyage.startDate, voyage.endDate)

  const trackDepthObject = {
    trackDepth: VesselTrackDepth.CUSTOM,
    afterDateTime: afterDateTime,
    beforeDateTime: beforeDateTime
  }

  dispatch(setSelectedVesselCustomTrackDepth(trackDepthObject))
  dispatch(modifyVesselTrackDepth(vesselIdentity, trackDepthObject)).then(() => {
    dispatch(setVoyage(voyage))
    if (fishingActivitiesAreShowedOnMap) {
      dispatch(showFishingActivitiesOnMap())
      dispatch(redrawFishingActivitiesOnMap())
    } else {
      dispatch(removeFishingActivitiesFromMap())
    }
  })
}

function getDateRangePlusOneDay (afterDateTime, beforeDateTime) {
  if (!afterDateTime && !beforeDateTime) {
    return {
      afterDateTime: null,
      beforeDateTime: null
    }
  }

  afterDateTime = new Date(afterDateTime)
  afterDateTime.setDate(afterDateTime.getDate() - 1)

  beforeDateTime = new Date(beforeDateTime)
  beforeDateTime.setDate(beforeDateTime.getDate() + 1)

  return {
    afterDateTime,
    beforeDateTime
  }
}

function gotNewFishingActivitiesWithMoreMessagesOrAlerts (lastFishingActivities, voyage) {
  return (lastFishingActivities.ersMessages && !lastFishingActivities.ersMessages.length) ||
    (lastFishingActivities.alerts && voyage.ersMessagesAndAlerts.alerts &&
      voyage.ersMessagesAndAlerts.alerts.length > lastFishingActivities.alerts.length) ||
    (lastFishingActivities.ersMessages && voyage.ersMessagesAndAlerts.ersMessages &&
      voyage.ersMessagesAndAlerts.ersMessages.length > lastFishingActivities.ersMessages.length)
}

const emptyVoyage = {
  ersMessagesAndAlerts: {
    ersMessages: [],
    alerts: []
  }
}

export default getVesselVoyage
