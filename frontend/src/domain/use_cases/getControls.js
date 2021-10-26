import { getVesselControlsFromAPI } from '../../api/fetch'
import { removeError, setError } from '../shared_slices/Global'
import { setControlResumeAndControls, setNextControlResumeAndControls } from '../shared_slices/Controls'
import NoControlsFoundError from '../../errors/NoControlsFoundError'
import { batch } from 'react-redux'
import { loading, resetLoadingVessel } from '../shared_slices/Vessel'

const getControls = userRequest => (dispatch, getState) => {
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
      dispatch(loading())
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
      dispatch(resetLoadingVessel())
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
      dispatch(resetLoadingVessel())
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
