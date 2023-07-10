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
import { displayOrLogError } from '../error/displayOrLogError'

export const getVesselControls = isFromCron => async (dispatch, getState) => {
  const { selectedVessel } = getState().vessel
  const { controlsFromDate, currentControlSummary, loadingControls } = getState().controls

  if (loadingControls) {
    return
  }

  if (!selectedVessel?.vesselId) {
    dispatch(setError(new NoControlsFoundError('Aucun contrôle connu')))
    dispatch(unsetControlSummary())

    return
  }

  const isSameVesselAsCurrentlyShowed = getIsSameVesselAsCurrentlyShowed(selectedVessel.vesselId, currentControlSummary)
  if (!isFromCron) {
    dispatch(setDisplayedErrors({ vesselSidebarError: null }))
    dispatch(loadControls())
  }

  try {
    const controlSummary = await getVesselControlsFromAPI(selectedVessel.vesselId, controlsFromDate)
    if (isSameVesselAsCurrentlyShowed && isFromCron) {
      if (controlSummary.controls?.length > currentControlSummary.missionActions?.length) {
        dispatch(setNextControlSummary(controlSummary))
      }
    } else {
      dispatch(setControlSummary(controlSummary))
    }
    dispatch(removeError())
  } catch (error) {
    dispatch(
      displayOrLogError(
        error as Error,
        {
          func: getVesselControls,
          parameters: [isFromCron]
        },
        isFromCron,
        'vesselSidebarError'
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
