import { getVesselVoyageFromAPI } from '../../api/fetch'
import { removeError, setError } from '../shared_slices/Global'
import { loading, resetLoadingVessel } from '../shared_slices/Vessel'
import {
  hideFishingActivitiesOnMap,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap
} from '../shared_slices/FishingActivities'
import NoERSMessagesFoundError from '../../errors/NoERSMessagesFoundError'
import { vesselsAreEquals } from '../entities/vessel'
import { batch } from 'react-redux'

export const NAVIGATE_TO = {
  PREVIOUS: 'PREVIOUS',
  NEXT: 'NEXT',
  LAST: 'LAST'
}

const getVesselVoyage = (vesselIdentity, navigateTo, fromCron) => (dispatch, getState) => {
  if (vesselIdentity) {
    const currentSelectedVesselIdentity = getState().vessel.selectedVesselIdentity
    const {
      lastFishingActivities,
      isLastVoyage,
      tripNumber,
      fishingActivitiesShowedOnMap
    } = getState().fishingActivities

    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)
    navigateTo = navigateTo || NAVIGATE_TO.LAST

    if (navigateTo === NAVIGATE_TO.NEXT && isLastVoyage) {
      console.error('This voyage is the last one.')
      return
    }

    if (!fromCron) {
      dispatch(loading())
    }

    getVesselVoyageFromAPI(vesselIdentity, navigateTo, tripNumber).then(voyage => {
      if (!voyage) {
        dispatch(setVoyage({
          ersMessagesAndAlerts: {
            ersMessages: [],
            alerts: []
          }
        }))
        dispatch(resetLoadingVessel())
        dispatch(hideFishingActivitiesOnMap())
        dispatch(setError(new NoERSMessagesFoundError('Ce navire n\'a pas envoyé de message JPE.')))
        return
      }

      if (isSameVesselAsCurrentlyShowed && fromCron) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
          dispatch(setNextFishingActivities(voyage.ersMessagesAndAlerts))
        }
      } else {
        if (voyage.isLastVoyage) {
          dispatch(setLastVoyage(voyage))
        }

        dispatch(setVoyage(voyage))
        dispatch(resetLoadingVessel())
        if (fishingActivitiesShowedOnMap?.length) {
          dispatch(showFishingActivitiesOnMap())
        }
      }
      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setVoyage({
          ersMessagesAndAlerts: {
            ersMessages: [],
            alerts: []
          }
        }))
        dispatch(setError(error))
        dispatch(resetLoadingVessel())
      })
    })
  }
}

function gotNewFishingActivitiesWithMoreMessagesOrAlerts (lastFishingActivities, voyage) {
  return (lastFishingActivities.ersMessages && !lastFishingActivities.ersMessages.length) ||
    (lastFishingActivities.alerts && voyage.ersMessagesAndAlerts.alerts &&
      voyage.ersMessagesAndAlerts.alerts.length > lastFishingActivities.alerts.length) ||
    (lastFishingActivities.ersMessages && voyage.ersMessagesAndAlerts.ersMessages &&
      voyage.ersMessagesAndAlerts.ersMessages.length > lastFishingActivities.ersMessages.length)
}

export default getVesselVoyage
