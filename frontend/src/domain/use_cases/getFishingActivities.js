import { getVesselERSMessagesFromAPI } from '../../api/fetch'
import { removeError, setError } from '../reducers/Global'
import {
  loadingFisheriesActivities,
  resetLoadingVessel,
  setFishingActivities,
  setNextFishingActivities
} from '../reducers/Vessel'
import NoERSMessagesFoundError from '../../errors/NoERSMessagesFoundError'

const getFishingActivities = vesselIdentity => (dispatch, getState) => {
  if (vesselIdentity) {
    const currentFishingActivities = getState().vessel.fishingActivities
    const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(vesselIdentity, currentFishingActivities)

    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(loadingFisheriesActivities())
    }
    getVesselERSMessagesFromAPI(vesselIdentity).then(fishingActivities => {
      if (!fishingActivities) {
        dispatch(setFishingActivities({
          ersMessages: [],
          alerts: []
        }))
        dispatch(setError(new NoERSMessagesFoundError("Ce navire n'a pas envoyé de message JPE.")))
        return
      }

      if (isSameVesselAsCurrentlyShowed) {
        if ((currentFishingActivities.alerts && fishingActivities.alerts &&
                    fishingActivities.alerts.length > currentFishingActivities.alerts.length) ||
                    (currentFishingActivities.ersMessages && fishingActivities.ersMessages &&
                        fishingActivities.ersMessages.length > currentFishingActivities.ersMessages.length)) {
          dispatch(setNextFishingActivities(fishingActivities))
        }
      } else {
        dispatch(setFishingActivities(fishingActivities))
      }
      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
  }
}

const getIsSameVesselAsCurrentlyShowed = (vesselIdentity, currentFishingActivities) => {
  if (currentFishingActivities && currentFishingActivities.ersMessages && currentFishingActivities.ersMessages.length) {
    if (vesselIdentity.internalReferenceNumber &&
            currentFishingActivities.ersMessages.some(ersMessage => ersMessage.internalReferenceNumber === vesselIdentity.internalReferenceNumber)) {
      return true
    }
    if (vesselIdentity.externalReferenceNumber &&
            currentFishingActivities.ersMessages.some(ersMessage => ersMessage.externalReferenceNumber === vesselIdentity.externalReferenceNumber)) {
      return true
    }
    if (vesselIdentity.ircs &&
            currentFishingActivities.ersMessages.some(ersMessage => ersMessage.ircs === vesselIdentity.ircs)) {
      return true
    }
  }

  return false
}

export default getFishingActivities
