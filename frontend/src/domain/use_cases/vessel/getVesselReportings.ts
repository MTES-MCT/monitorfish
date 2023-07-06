import { getVesselReportingsFromAPI } from '../../../api/vessel'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { removeError } from '../../shared_slices/Global'
import {
  loadReporting,
  resetCurrentAndArchivedReportingsOfSelectedVessel,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../shared_slices/Reporting'
import { displayOrLogVesselSidebarError } from '../error/displayOrLogVesselSidebarError'

export const getVesselReportings = (isFromCron: boolean) => async (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { archivedReportingsFromDate } = getState().reporting

  if (!selectedVesselIdentity || !archivedReportingsFromDate) {
    return
  }

  if (!isFromCron) {
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
      displayOrLogVesselSidebarError(
        error as Error,
        {
          func: getVesselReportings,
          parameters: [isFromCron]
        },
        isFromCron
      )
    )
    dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
  }
}
