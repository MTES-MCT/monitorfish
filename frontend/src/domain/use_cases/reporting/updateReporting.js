import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReportings, updateCurrentReporting } from '../../shared_slices/Reporting'
import { updateReportingFromAPI } from '../../../api/reporting'

const updateReporting = (id, nextReporting) => async (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings,
    vesselIdentity
  } = getState().reporting

  updateReportingFromAPI(id, nextReporting).then(updatedReporting => {
    console.log(updatedReporting)
    dispatch(updateCurrentReporting(updatedReporting))
    if (vesselIdentity && currentAndArchivedReportings.current?.length) {
      const nextCurrentAndArchivedReporting = updateCurrentAndArchivedReporting(currentAndArchivedReportings, updatedReporting)
      dispatch(setCurrentAndArchivedReportings({
        currentAndArchivedReportings: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    batch(() => {
      dispatch(setCurrentAndArchivedReportings({
        currentAndArchivedReportings: currentAndArchivedReportings,
        vesselIdentity: selectedVesselIdentity
      }))
      dispatch(setError(error))
    })
  })
}

function updateCurrentAndArchivedReporting (currentAndArchivedReportings, updatedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current
    .filter(reporting => reporting.id !== updatedReporting.id)
    .concat(updatedReporting)

  return nextCurrentAndArchivedReporting
}

export default updateReporting
