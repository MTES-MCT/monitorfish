import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReportingsOfSelectedVessel, updateCurrentReporting } from '../../shared_slices/Reporting'
import { updateReportingFromAPI } from '../../../api/reporting'

const updateReporting = (id, nextReporting) => async (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportingsOfSelectedVessel,
    vesselIdentity
  } = getState().reporting

  updateReportingFromAPI(id, nextReporting).then(updatedReporting => {
    dispatch(updateCurrentReporting(updatedReporting))
    if (vesselIdentity && currentAndArchivedReportingsOfSelectedVessel.current?.length) {
      const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(currentAndArchivedReportingsOfSelectedVessel, updatedReporting)
      dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
        currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    batch(() => {
      dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
        currentAndArchivedReportingsOfSelectedVessel: currentAndArchivedReportingsOfSelectedVessel,
        vesselIdentity: selectedVesselIdentity
      }))
      dispatch(setError(error))
    })
  })
}

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel (currentAndArchivedReportingsOfSelectedVessel, updatedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current
    .filter(reporting => reporting.id !== updatedReporting.id)
    .concat(updatedReporting)

  return nextCurrentAndArchivedReporting
}

export default updateReporting
