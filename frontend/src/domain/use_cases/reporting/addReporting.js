import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentAndArchivedReportingsOfSelectedVessel } from '../../shared_slices/Reporting'
import { Vessel } from '../../entities/vessel'
import { addVesselReporting } from '../../shared_slices/Vessel'
import { addReportingFromAPI } from '../../../api/reporting'

const addReporting = newReporting => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportingsOfSelectedVessel
  } = getState().reporting

  return addReportingFromAPI(newReporting).then(reporting => {
    const nextCurrentAndArchivedReporting = addReportingToCurrent(currentAndArchivedReportingsOfSelectedVessel, reporting)
    dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
      currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity
    }))
    dispatch(addVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: newReporting?.type
    }))
    dispatch(removeError())

    return Promise.resolve()
  }).catch(error => {
    dispatch(setError(error))

    return Promise.reject(error)
  })
}

function addReportingToCurrent (currentAndArchivedReportingsOfSelectedVessel, newReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.concat(newReporting)

  return nextCurrentAndArchivedReporting
}

export default addReporting
