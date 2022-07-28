import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { setCurrentAndArchivedReportings } from '../../shared_slices/Reporting'
import { archiveReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const archiveReportings = ids => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings,
    currentReportings,
    vesselIdentity
  } = getState().reporting
  // TODO Write the logic of archiveReporting.js for multiple reportings and also mutate currentReportings state

  if (vesselIdentity) {
    ids.forEach(id => {
      const archivedReporting = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
      const nextCurrentAndArchivedReporting = moveReportingToArchived(currentAndArchivedReportings, archivedReporting)
      dispatch(setCurrentAndArchivedReportings({
        currentAndArchivedReportings: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    })
  }

  archiveReportingFromAPI(id).then(() => {
    dispatch(removeVesselReporting({
      vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
      reportingType: archivedReporting?.type
    }))
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    if (vesselIdentity) {
      dispatch(setCurrentAndArchivedReportings({
        currentAndArchivedReportings: currentAndArchivedReportings,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(setError(error))
  })
}

function moveReportingToArchived (currentAndArchivedReportings, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== archivedReporting.id)
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default archiveReportings
