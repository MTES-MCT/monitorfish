import { addReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import {
  setCurrentAndArchivedReportingsOfSelectedVessel,
  addReportingToCurrentReportings
} from '../../shared_slices/Reporting'
import { addVesselReporting } from '../../shared_slices/Vessel'

import type { AppDispatch, AppGetState } from '../../../store'
import type { Reporting } from '../../types/reporting'

export const addReporting = (newReporting: Reporting) => (dispatch: AppDispatch, getState: AppGetState) => {
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
