import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReporting } from '../../shared_slices/Reporting'
import { archiveReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const archiveReporting = id => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReporting
  } = getState().reporting

  const archivedReporting = currentAndArchivedReporting.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = moveReportingToArchived(currentAndArchivedReporting, archivedReporting)
  dispatch(setCurrentAndArchivedReporting({
    currentAndArchivedReporting: nextCurrentAndArchivedReporting,
    vesselIdentity: selectedVesselIdentity
  }))

  archiveReportingFromAPI(id).then(() => {
    dispatch(removeVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: archivedReporting?.type
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

function moveReportingToArchived (currentAndArchivedReporting, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReporting }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default archiveReporting
