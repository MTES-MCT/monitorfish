import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportings
} from '../../shared_slices/Reporting'
import { updateReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const updateReporting = (id, updatedReporting) => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings
  } = getState().reporting

  const archivedReporting = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = moveReportingToArchived(currentAndArchivedReportings, archivedReporting)
  dispatch(setCurrentAndArchivedReportings({
    currentAndArchivedReportings: nextCurrentAndArchivedReporting,
    vesselIdentity: selectedVesselIdentity
  }))

  updateReportingFromAPI(id, updatedReporting).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings([id]))
    dispatch(removeVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: archivedReporting?.type
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

function moveReportingToArchived (currentAndArchivedReportings, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default updateReporting
