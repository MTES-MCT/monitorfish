import { batch } from 'react-redux'

import { getVesselControlsFromAPI } from '../../../api/mission'
import NoControlsFoundError from '../../../errors/NoControlsFoundError'
import { loadControls, setControlSummary, setNextControlSummary } from '../../shared_slices/Control'
import { removeError, setError } from '../../shared_slices/Global'

export const getVesselControls = userRequest => (dispatch, getState) => {
  const { selectedVessel } = getState().vessel
  const { controlsFromDate, currentControlSummary } = getState().controls

  if (!selectedVessel) {
    return
  }

  if (!selectedVessel.vesselId) {
    batch(() => {
      dispatch(setError(new NoControlsFoundError('Aucun contrôle connu')))
      dispatch(
        setControlSummary({
          controls: []
        })
      )
    })

    return
  }

  const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(selectedVessel.vesselId, currentControlSummary)
  if (!isSameVesselAsCurrentlyShowed) {
    dispatch(loadControls())
  }

  getVesselControlsFromAPI(selectedVessel.vesselId, controlsFromDate)
    .then(controlSummary => {
      if (isSameVesselAsCurrentlyShowed && !userRequest) {
        if (controlSummary.controls?.length > currentControlSummary.missionActions?.length) {
          dispatch(setNextControlSummary(controlSummary))
        }
      } else {
        dispatch(setControlSummary(controlSummary))
      }
      dispatch(removeError())
    })
    .catch(error => {
      batch(() => {
        dispatch(setError(error))
      })
    })
}

const getIsSameVesselAsCurrentlyShowed = (vesselId, currentControlSummary) => {
  if (currentControlSummary?.vesselId) {
    return vesselId === currentControlSummary.vesselId
  }

  return false
}
