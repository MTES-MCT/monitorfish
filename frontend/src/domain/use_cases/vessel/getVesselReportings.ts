import { getVesselReportingsFromAPI } from '../../../api/vessel'
import {
  loadReporting,
  resetCurrentAndArchivedReportingsOfSelectedVessel,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../../features/Reporting/slice'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { removeError } from '../../shared_slices/Global'
import { displayOrLogError } from '../error/displayOrLogError'

export const getVesselReportings = (isFromUserAction: boolean) => async (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { archivedReportingsFromDate, isLoadingReporting } = getState().reporting

  if (!selectedVesselIdentity || !archivedReportingsFromDate || isLoadingReporting) {
    return
  }

  if (isFromUserAction) {
    dispatch(setDisplayedErrors({ vesselSidebarError: null }))
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
        {
          func: getVesselReportings,
          parameters: [isFromUserAction]
        },
        isFromUserAction,
        'vesselSidebarError'
      )
    )
    dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
  }
}
