import { getVesselControlsFromAPI } from '../../api/fetch'
import { removeError, setError } from '../reducers/Global'
import {
  loadingControls,
  resetLoadingVessel,
  setControlResumeAndControls,
  setNextControlResumeAndControls
} from '../reducers/Vessel'
import NoControlsFoundError from '../../errors/NoControlsFoundError'

const getControls = (vesselId, fromDate, userRequest) => (dispatch, getState) => {
  if (vesselId) {
    const currentControlResumeAndControls = getState().vessel.controlResumeAndControls
    const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(vesselId, currentControlResumeAndControls)

    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(loadingControls())
    }

    getVesselControlsFromAPI(vesselId, fromDate).then(controlResumeAndControls => {
      if (isSameVesselAsCurrentlyShowed && !userRequest) {
        if (currentControlResumeAndControls.controls && controlResumeAndControls.controls &&
                    controlResumeAndControls.controls.length > currentControlResumeAndControls.controls.length) {
          dispatch(setNextControlResumeAndControls(controlResumeAndControls))
        }
      } else {
        dispatch(setControlResumeAndControls(controlResumeAndControls))
      }
      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
  } else {
    dispatch(setError(new NoControlsFoundError("Ce navire n'a aucun contrôle")))
    dispatch(setControlResumeAndControls({
      controls: []
    }))
  }
}

const getIsSameVesselAsCurrentlyShowed = (vesselId, controlResumeAndControls) => {
  if (controlResumeAndControls && controlResumeAndControls.vesselId) {
    return vesselId === controlResumeAndControls.vesselId
  }

  return false
}

export default getControls
