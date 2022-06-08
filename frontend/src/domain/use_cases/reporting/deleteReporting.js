import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReportings } from '../../shared_slices/Reporting'
import { deleteReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const deleteReporting = id => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings
  } = getState().reporting

  const deletedReporting = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = deleteFromCurrentReportingList(currentAndArchivedReportings, deletedReporting)
  dispatch(setCurrentAndArchivedReportings({
    currentAndArchivedReportings: nextCurrentAndArchivedReporting,
    vesselIdentity: selectedVesselIdentity
  }))

  deleteReportingFromAPI(id).then(() => {
    dispatch(removeVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: deletedReporting?.type
    }))
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

function deleteFromCurrentReportingList (currentAndArchivedReportings, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)

  return nextCurrentAndArchivedReporting
}

export default deleteReporting
