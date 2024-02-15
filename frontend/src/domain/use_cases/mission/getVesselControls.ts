import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { getVesselControlsFromAPI } from '../../../api/missionAction'
import NoControlsFoundError from '../../../errors/NoControlsFoundError'
import {
  loadControls,
  resetLoadControls,
  setControlSummary,
  setNextControlSummary,
  unsetControlSummary
} from '../../shared_slices/Control'
import { displayedErrorActions } from '../../shared_slices/DisplayedError'
import { removeError, setError } from '../../shared_slices/Global'
import { displayOrLogError } from '../error/displayOrLogError'

export const getVesselControls = (isFromUserAction: boolean) => async (dispatch, getState) => {
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
  if (isFromUserAction) {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(loadControls())
  }

  try {
    const controlSummary = await getVesselControlsFromAPI(selectedVessel.vesselId, controlsFromDate)
    if (isSameVesselAsCurrentlyShowed && !isFromUserAction) {
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
        error,
        () => getVesselControls(isFromUserAction),
        isFromUserAction,
        DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
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
