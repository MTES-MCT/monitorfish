import { getVesselControlsFromAPI } from '../../../api/missionAction'
import NoControlsFoundError from '../../../errors/NoControlsFoundError'
import {
  loadControls,
  resetLoadControls,
  setControlSummary,
  setNextControlSummary,
  unsetControlSummary
} from '../../shared_slices/Control'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { removeError, setError } from '../../shared_slices/Global'
import { displayOrLogVesselSidebarError } from '../error/displayOrLogVesselSidebarError'

export const getVesselControls = userRequest => async (dispatch, getState) => {
  const { selectedVessel } = getState().vessel
  const { controlsFromDate, currentControlSummary } = getState().controls

  if (!selectedVessel) {
    return
  }

  if (!selectedVessel.vesselId) {
    dispatch(setError(new NoControlsFoundError('Aucun contrôle connu')))
    dispatch(unsetControlSummary())

    return
  }

  const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(selectedVessel.vesselId, currentControlSummary)
  if (!isSameVesselAsCurrentlyShowed) {
    dispatch(setDisplayedErrors({ vesselSidebarError: null }))
    dispatch(loadControls())
  }

  try {
    const controlSummary = await getVesselControlsFromAPI(selectedVessel.vesselId, controlsFromDate)
    if (isSameVesselAsCurrentlyShowed && !userRequest) {
      if (controlSummary.controls?.length > currentControlSummary.missionActions?.length) {
        dispatch(setNextControlSummary(controlSummary))
      }
    } else {
      dispatch(setControlSummary(controlSummary))
    }
    dispatch(removeError())
  } catch (error) {
    dispatch(
      displayOrLogVesselSidebarError(
        error,
        {
          func: getVesselControls,
          parameters: [userRequest]
        },
        !userRequest
      )
    )
    dispatch(resetLoadControls())
  }
}

const getIsSameVesselAsCurrentlyShowed = (vesselId, currentControlSummary) => {
  if (currentControlSummary?.vesselId) {
    return vesselId === currentControlSummary.vesselId
  }

  return false
}
