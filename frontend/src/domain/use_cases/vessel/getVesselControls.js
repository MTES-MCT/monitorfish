import { removeError, setError } from '../../shared_slices/Global'
import {
  loadControls,
  setControlResumeAndControls,
  setNextControlResumeAndControls
} from '../../shared_slices/Control'
import NoControlsFoundError from '../../../errors/NoControlsFoundError'
import { batch } from 'react-redux'
import { getVesselControlsFromAPI } from '../../../api/vessel'

const getVesselControls = userRequest => (dispatch, getState) => {
  const {
    selectedVessel
  } = getState().vessel

  const {
    currentControlResumeAndControls,
    controlsFromDate
  } = getState().controls

  if (selectedVessel?.id) {
    const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(selectedVessel.id, currentControlResumeAndControls)

    if (!isSameVesselAsCurrentlyShowed) {
      dispatch(loadControls())
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

const getIsSameVesselAsCurrentlyShowed = (vesselInternalId, controlResumeAndControls) => {
  if (controlResumeAndControls?.vesselInternalId) {
    return vesselInternalId === controlResumeAndControls.vesselInternalId
  }

  return false
}

export default getVesselControls
