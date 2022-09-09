import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../shared_slices/Reporting'
import { deleteReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const deleteReporting = id => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportingsOfSelectedVessel
  } = getState().reporting

  const deletedReporting = currentAndArchivedReportingsOfSelectedVessel.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(currentAndArchivedReportingsOfSelectedVessel, deletedReporting)
  dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
    currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
    vesselIdentity: selectedVesselIdentity
  }))

  deleteReportingFromAPI(id).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings([id]))
    dispatch(removeVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: deletedReporting?.type
    }))
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

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel (currentAndArchivedReportingsOfSelectedVessel, deletedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== deletedReporting.id)

  return nextCurrentAndArchivedReporting
}

export default deleteReporting
