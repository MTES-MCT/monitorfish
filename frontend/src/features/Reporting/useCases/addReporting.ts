import { addReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { addVesselReporting } from '../../../domain/shared_slices/Vessel'
import { addReportingToCurrentReportings, setCurrentAndArchivedReportingsOfSelectedVessel } from '../slice'

import type { ReportingCreation } from '../../../domain/types/reporting'
import type { MainAppThunk } from '../../../store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk<Promise<void>> =>
  (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel
    const { currentAndArchivedReportingsOfSelectedVessel } = getState().reporting

    return addReportingFromAPI(newReporting)
      .then(reporting => {
        dispatch(addReportingToCurrentReportings(reporting))
        const nextCurrentAndArchivedReporting = addReportingToCurrent(
          currentAndArchivedReportingsOfSelectedVessel,
          reporting
        )
        dispatch(
          setCurrentAndArchivedReportingsOfSelectedVessel({
            currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
            vesselIdentity: selectedVesselIdentity
          })
        )
        dispatch(
          addVesselReporting({
            reportingType: newReporting?.type,
            vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
          })
        )
        dispatch(removeError())

        return Promise.resolve()
      })
      .catch(error => {
        dispatch(setError(error))

        return Promise.reject(error)
      })
  }

function addReportingToCurrent(currentAndArchivedReportingsOfSelectedVessel, newReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.concat(newReporting)

  return nextCurrentAndArchivedReporting
}
