import { getVesselControlsFromAPI } from '../../api/fetch'
import { removeError, setError } from '../shared_slices/Global'
import {
  loadingControls,
  resetLoadingVessel,
  setControlResumeAndControls,
  setNextControlResumeAndControls
} from '../shared_slices/Vessel'
import NoControlsFoundError from '../../errors/NoControlsFoundError'
import { batch } from 'react-redux'

const getControls = userRequest => (dispatch, getState) => {
  const {
    currentControlResumeAndControls,
    controlsFromDate,
    selectedVessel
  } = getState().vessel

  if (selectedVessel?.id) {
    const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(selectedVessel.id, currentControlResumeAndControls)

    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(loadingControls())
    }

    getVesselControlsFromAPI(selectedVessel.id, controlsFromDate).then(controlResumeAndControls => {
      if (isSameVesselAsCurrentlyShowed && !userRequest) {
        if (controlResumeAndControls.controls?.length > currentControlResumeAndControls.controls?.length) {
          dispatch(setNextControlResumeAndControls(controlResumeAndControls))
        }
      } else {
        dispatch(setControlResumeAndControls(controlResumeAndControls))
      }
      dispatch(removeError())
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setError(error))
        dispatch(resetLoadingVessel())
      })
    })
  } else {
    batch(() => {
      dispatch(setError(new NoControlsFoundError('Aucun contrôle connu')))
      dispatch(setControlResumeAndControls({
        controls: []
      }))
    })
  }
}

const getIsSameVesselAsCurrentlyShowed = (vesselId, controlResumeAndControls) => {
  if (controlResumeAndControls?.vesselId) {
    return vesselId === controlResumeAndControls.vesselId
  }

  return false
}

export default getControls
