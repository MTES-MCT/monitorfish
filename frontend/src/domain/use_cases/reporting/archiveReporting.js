import { batch } from 'react-redux'

import { archiveReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentAndArchivedReportings } from '../../shared_slices/Reporting'
import { removeVesselReporting } from '../../shared_slices/Vessel'

const archiveReporting = id => (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { currentAndArchivedReportings } = getState().reporting

  const archivedReporting = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = moveReportingToArchived(currentAndArchivedReportings, archivedReporting)
  dispatch(
    setCurrentAndArchivedReportings({
      currentAndArchivedReportings: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity,
    }),
  )

  archiveReportingFromAPI(id)
    .then(() => {
      dispatch(
        removeVesselReporting({
          reportingType: archivedReporting?.type,
          vesselId: Vessel.getVesselFeatureId(selectedVesselIdentity),
        }),
      )
      dispatch(removeError())
    })
    .catch(error => {
      console.error(error)
      batch(() => {
        dispatch(
          setCurrentAndArchivedReportings({
            currentAndArchivedReportings,
            vesselIdentity: selectedVesselIdentity,
          }),
        )
        dispatch(setError(error))
      })
    })
}

function moveReportingToArchived(currentAndArchivedReportings, archivedReporting) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(
    reporting => reporting.id !== archivedReporting.id,
  )
  nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(archivedReporting)

  return nextCurrentAndArchivedReporting
}

export default archiveReporting
