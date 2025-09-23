import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { missionActionApi } from '@features/Mission/missionActionApi'
import { Vessel } from '@features/Vessel/Vessel.types'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../../../domain/shared_slices/DisplayedError'
import { displayOrLogError } from '../../../../../domain/use_cases/error/displayOrLogError'
import { loadControls, resetLoadControls, setControlSummary, unsetControlSummary } from '../control.slice'

export const getVesselControls = (vesselIdentity: Vessel.VesselIdentity) => async (dispatch, getState) => {
  const {
    controls: { controlsFromDate, isLoadingControls }
  } = getState()

  if (isLoadingControls) {
    return
  }

  if (!vesselIdentity?.vesselId) {
    dispatch(unsetControlSummary())

    return
  }

  dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
  dispatch(loadControls())

  try {
    const controlSummary = await dispatch(
      missionActionApi.endpoints.getVesselControls.initiate(
        {
          fromDate: controlsFromDate,
          vesselId: vesselIdentity.vesselId
        },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    ).unwrap()

    dispatch(setControlSummary(controlSummary))
  } catch (error) {
    dispatch(
      displayOrLogError(error, () => getVesselControls(vesselIdentity), true, DisplayedErrorKey.VESSEL_SIDEBAR_ERROR)
    )
    dispatch(resetLoadControls())
  }
}
