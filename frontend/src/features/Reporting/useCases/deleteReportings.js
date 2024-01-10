import { deleteReportingsFromAPI } from '../../../api/reporting'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeError, setError } from '../../../domain/shared_slices/Global'
import { removeVesselReportings } from '../../../domain/shared_slices/Vessel'
import { removeReportingsIdsFromCurrentReportings, setCurrentAndArchivedReportingsOfSelectedVessel } from '../slice'

/**
 * Delete multiple reportings
 * @param {number[]} ids - The ids of reporting to delete
 */
const deleteReportings = ids => async (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { currentAndArchivedReportingsOfSelectedVessel, currentReportings, vesselIdentity } = getState().reporting
  const deletedReportings = getDeletedReportingsFromIds(ids, currentReportings)

  return deleteReportingsFromAPI(ids)
    .then(() => {
      dispatch(removeReportingsIdsFromCurrentReportings(ids))
      dispatch(removeVesselReportings(deletedReportings))
      if (vesselIdentity && currentAndArchivedReportingsOfSelectedVessel.current?.length) {
        const deletedReportingsOfSelectedVessel = getDeletedReportingOfSelectedVesselFromIds(
          ids,
          currentAndArchivedReportingsOfSelectedVessel
        )

        const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
          currentAndArchivedReportingsOfSelectedVessel,
          deletedReportingsOfSelectedVessel
        )
        dispatch(
          setCurrentAndArchivedReportingsOfSelectedVessel({
            currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
            vesselIdentity: selectedVesselIdentity
          })
        )
      }
      dispatch(removeError())
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

function getDeletedReportingsFromIds(ids, currentReportings) {
  return ids
    .map(id => {
      const reporting = currentReportings.find(reporting => reporting.id === id)
      if (!reporting) {
        return null
      }

      return {
        id: reporting.id,
        type: reporting.type,
        vesselFeatureId: Vessel.getVesselFeatureId(reporting)
      }
    })
    .filter(reporting => reporting)
}

function getDeletedReportingOfSelectedVesselFromIds(ids, currentAndArchivedReportingsOfSelectedVessel) {
  return ids
    .map(id => {
      const reportingToArchive = currentAndArchivedReportingsOfSelectedVessel.current.find(
        reporting => reporting.id === id
      )
      if (reportingToArchive) {
        return reportingToArchive
      }
    })
    .filter(reporting => reporting)
}

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
  currentAndArchivedReportingsOfSelectedVessel,
  deletedReportings
) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  deletedReportings.forEach(reportingToArchive => {
    nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(
      reporting => reporting.id !== reportingToArchive.id
    )
  })

  return nextCurrentAndArchivedReporting
}

export default deleteReportings
