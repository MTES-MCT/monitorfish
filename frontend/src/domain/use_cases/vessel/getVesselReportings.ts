import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { getVesselReportingsFromAPI } from '../../../api/vessel'
import { removeError } from '../../../features/MainWindow/slice'
import {
  loadReporting,
  resetCurrentAndArchivedReportingsOfSelectedVessel,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../../features/Reporting/slice'
import { displayedErrorActions } from '../../shared_slices/DisplayedError'
import { displayOrLogError } from '../error/displayOrLogError'

export const getVesselReportings = (isFromUserAction: boolean) => async (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { archivedReportingsFromDate, isLoadingReporting } = getState().reporting

  if (!selectedVesselIdentity || !archivedReportingsFromDate || isLoadingReporting) {
    return
  }

  if (isFromUserAction) {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(loadReporting())
  }

  try {
    const nextCurrentAndArchivedReporting = await getVesselReportingsFromAPI(
      selectedVesselIdentity,
      archivedReportingsFromDate
    )
    dispatch(
      setCurrentAndArchivedReportingsOfSelectedVessel({
        currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      })
    )

    dispatch(removeError())
  } catch (error) {
    dispatch(
      displayOrLogError(
        error as Error,
        () => getVesselReportings(isFromUserAction),
        isFromUserAction,
        DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
      )
    )
    dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
  }
}
