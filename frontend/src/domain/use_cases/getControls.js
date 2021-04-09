import { getVesselControlsFromAPI } from '../../api/fetch'
import { removeError, setError } from '../reducers/Global'
import {
    loadingControls,
    resetLoadingVessel,
    setControlResumeAndControls,
    setNextControlResumeAndControls
} from '../reducers/Vessel'

const getControls = (vesselId, fromDate, userRequest) => (dispatch, getState) => {
    if(vesselId) {
        let currentControlResumeAndControls = getState().vessel.controlResumeAndControls
        let isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(vesselId, currentControlResumeAndControls)

        if(!isSameVesselAsCurrentlyShowed) {
            dispatch(loadingControls())
        }

        getVesselControlsFromAPI(vesselId, fromDate).then(controlResumeAndControls => {
            if(isSameVesselAsCurrentlyShowed && !userRequest) {
                if(currentControlResumeAndControls.controls && controlResumeAndControls.controls &&
                    controlResumeAndControls.controls.length > currentControlResumeAndControls.controls.length) {
                    dispatch(setNextControlResumeAndControls(controlResumeAndControls))
                }
            } else {
                dispatch(setControlResumeAndControls(controlResumeAndControls))
            }
            dispatch(removeError());
        }).catch(error => {
            console.error(error)
            dispatch(setError(error))
            dispatch(resetLoadingVessel())
        });
    }
}

const getIsSameVesselAsCurrentlyShowed = (vesselId, controlResumeAndControls) => {
    if(controlResumeAndControls && controlResumeAndControls.vesselId) {
        return vesselId === controlResumeAndControls.vesselId
    }

    return false
}

export default getControls
