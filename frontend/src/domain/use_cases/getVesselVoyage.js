import { getVesselVoyageFromAPI } from '../../api/fetch'
import { removeError, setError } from '../reducers/Global'
import {
  loadingFisheriesActivities,
  resetLoadingVessel,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage
} from '../reducers/Vessel'
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
      previousBeforeDateTime,
      nextBeforeDateTime
    } = getState().vessel
    const isSameVesselAsCurrentlyShowed = vesselsAreEquals(vesselIdentity, currentSelectedVesselIdentity)

    if (navigateTo === NAVIGATE_TO.NEXT && isLastVoyage) {
      console.error('This voyage is the last one.')
      return
    }

    let beforeDateTime = null
    switch (navigateTo) {
      case NAVIGATE_TO.PREVIOUS:
        beforeDateTime = previousBeforeDateTime
        break
      case NAVIGATE_TO.NEXT:
        beforeDateTime = nextBeforeDateTime
        break
      case NAVIGATE_TO.LAST:
        beforeDateTime = null
        break
    }

    if (!fromCron) {
      dispatch(loadingFisheriesActivities())
    }

    getVesselVoyageFromAPI(vesselIdentity, beforeDateTime).then(voyage => {
      if (!voyage) {
        dispatch(setVoyage({
          ersMessagesAndAlerts: {
            ersMessages: [],
            alerts: []
          }
        }))
        dispatch(setError(new NoERSMessagesFoundError('Ce navire n\'a pas envoyé de message JPE.')))
        return
      }

      if (isSameVesselAsCurrentlyShowed && fromCron) {
        if (gotNewFishingActivitiesWithMoreMessagesOrAlerts(lastFishingActivities, voyage)) {
          dispatch(setNextFishingActivities(voyage.ersMessagesAndAlerts))
        }
      } else {
        if (!beforeDateTime) {
          dispatch(setLastVoyage(voyage))
        } else {
          dispatch(setVoyage(voyage))
        }
      }
      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      batch(() => {
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
