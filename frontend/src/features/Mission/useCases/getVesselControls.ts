import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { missionActionApi } from '@features/Mission/missionActionApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import {
  loadControls,
  resetLoadControls,
  setControlSummary,
  setNextControlSummary,
  unsetControlSummary
} from '../../../domain/shared_slices/Control'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { NoControlsFoundError } from '../../../errors/NoControlsFoundError'

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
    const controlSummary = await dispatch(
      missionActionApi.endpoints.getVesselControls.initiate(
        {
          fromDate: controlsFromDate,
          vesselId: selectedVessel.vesselId
        },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    ).unwrap()

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
