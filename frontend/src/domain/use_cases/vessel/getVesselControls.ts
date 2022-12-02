import { batch } from 'react-redux'

import { getVesselControlsFromAPI } from '../../../api/vessel'
import NoControlsFoundError from '../../../errors/NoControlsFoundError'
import { loadControls, setControlSummary, setNextControlSummary } from '../../shared_slices/Control'
import { removeError, setError } from '../../shared_slices/Global'

export const getVesselControls = userRequest => (dispatch, getState) => {
  const { selectedVessel } = getState().vessel
  const { controlsFromDate, currentControlSummary } = getState().controls

  if (!selectedVessel.vesselInternalId) {
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

  const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(
    selectedVessel.vesselInternalId,
    currentControlSummary
  )
  if (!isSameVesselAsCurrentlyShowed) {
    dispatch(loadControls())
  }

  getVesselControlsFromAPI(selectedVessel.vesselInternalId, controlsFromDate)
    .then(controlSummary => {
      if (isSameVesselAsCurrentlyShowed && !userRequest) {
        if (controlSummary.controls?.length > currentControlSummary.controls?.length) {
          dispatch(setNextControlSummary(controlSummary))
        }
      } else {
        dispatch(setControlSummary(controlSummary))
      }
      dispatch(removeError())
    })
    .catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setError(error))
      })
    })
}

const getIsSameVesselAsCurrentlyShowed = (vesselInternalId, currentControlSummary) => {
  if (currentControlSummary?.vesselInternalId) {
    return vesselInternalId === currentControlSummary.vesselInternalId
  }

  return false
}
