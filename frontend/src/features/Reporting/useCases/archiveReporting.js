import { batch } from 'react-redux'

import { archiveReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { removeVesselReporting } from '../../../domain/shared_slices/Vessel'
import { removeReportingsIdsFromCurrentReportings, setCurrentAndArchivedReportingsOfSelectedVessel } from '../slice'

const archiveReporting = id => (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { currentAndArchivedReportingsOfSelectedVessel } = getState().reporting

  const archivedReporting = currentAndArchivedReportingsOfSelectedVessel.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = moveReportingOfSelectedVesselToArchived(
    currentAndArchivedReportingsOfSelectedVessel,
    archivedReporting
  )
  dispatch(
    setCurrentAndArchivedReportingsOfSelectedVessel({
      currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity
    })
  )

  archiveReportingFromAPI(id)
    .then(() => {
      dispatch(removeReportingsIdsFromCurrentReportings([id]))
      dispatch(
        removeVesselReporting({
          reportingType: archivedReporting?.type,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )
      dispatch(removeError())
    })
    .catch(error => {
      console.error(error)
      batch(() => {
        dispatch(
          setCurrentAndArchivedReportingsOfSelectedVessel({
            currentAndArchivedReportingsOfSelectedVessel,
            vesselIdentity: selectedVesselIdentity
          })
        )
        dispatch(setError(error))
      })
    })
}

function moveReportingOfSelectedVesselToArchived(currentAndArchivedReportingsOfSelectedVessel, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(
    reporting => reporting.id !== archivedReporting.id
  )
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default archiveReporting
