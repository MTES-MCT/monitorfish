import {getVesselERSMessagesFromAPI} from "../../api/fetch";
import {removeError, setError} from "../reducers/Global";
import {loadingFisheriesActivities, resetLoadingVessel, setFishingActivities} from "../reducers/Vessel";

const getFishingActivities = vesselIdentity => (dispatch, getState) => {
    if(vesselIdentity){
        let currentFishingActivities = getState().vessel.fishingActivities
        if(currentFishingActivities && currentFishingActivities.length) {
            if(vesselIdentity.internalReferenceNumber &&
                currentFishingActivities.some(ersMessage => ersMessage.internalReferenceNumber === vesselIdentity.internalReferenceNumber)) {
                return
            }
            if(vesselIdentity.externalReferenceNumber &&
                currentFishingActivities.some(ersMessage => ersMessage.externalReferenceNumber === vesselIdentity.externalReferenceNumber)) {
                return
            }
            if(vesselIdentity.ircs &&
                currentFishingActivities.some(ersMessage => ersMessage.ircs === vesselIdentity.ircs)) {
                return
            }
        }

        dispatch(loadingFisheriesActivities())
        getVesselERSMessagesFromAPI(vesselIdentity).then(fishingActivities => {
            dispatch(setFishingActivities(fishingActivities))
            dispatch(removeError());
        }).catch(error => {
            console.error(error)
            dispatch(setError(error))
            dispatch(resetLoadingVessel())
        });
    }
}

export default getFishingActivities
