import {getVesselERSMessagesFromAPI} from "../../api/fetch";
import {setError} from "../reducers/Global";
import {loadingFisheriesActivities, setFishingActivities} from "../reducers/Vessel";

const getFishingActivities = vesselIdentity => dispatch => {
    if(vesselIdentity){
        dispatch(loadingFisheriesActivities())
        getVesselERSMessagesFromAPI(vesselIdentity).then(fishingActivities => {
            dispatch(setFishingActivities(fishingActivities))
        }).catch(error => {
            console.error(error)
            dispatch(setError(error));
        });
    }
}

export default getFishingActivities
