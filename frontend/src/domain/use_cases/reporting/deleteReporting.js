import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReporting } from '../../shared_slices/Reporting'
import { deleteReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const deleteReporting = id => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReporting
  } = getState().reporting

  const deletedReporting = currentAndArchivedReporting.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = deleteFromCurrentReportingList(currentAndArchivedReporting, deletedReporting)
  dispatch(setCurrentAndArchivedReporting({
    currentAndArchivedReporting: nextCurrentAndArchivedReporting,
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
      dispatch(setCurrentAndArchivedReporting({
        currentAndArchivedReporting: currentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
      dispatch(setError(error))
    })
  })
}

function deleteFromCurrentReportingList (currentAndArchivedReporting, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReporting }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)

  return nextCurrentAndArchivedReporting
}

export default deleteReporting
