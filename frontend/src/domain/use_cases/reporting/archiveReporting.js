import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../shared_slices/Reporting'
import { archiveReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const archiveReporting = id => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportingsOfSelectedVessel
  } = getState().reporting

  const archivedReporting = currentAndArchivedReportingsOfSelectedVessel.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = moveReportingOfSelectedVesselToArchived(currentAndArchivedReportingsOfSelectedVessel, archivedReporting)
  dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
    currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
    vesselIdentity: selectedVesselIdentity
  }))

  archiveReportingFromAPI(id).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings([id]))
    dispatch(removeVesselReporting({
      vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: archivedReporting?.type
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

function moveReportingOfSelectedVesselToArchived (currentAndArchivedReportingsOfSelectedVessel, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default archiveReporting
