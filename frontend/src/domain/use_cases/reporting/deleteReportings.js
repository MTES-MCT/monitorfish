import { removeError, setError } from '../../shared_slices/Global'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportings
} from '../../shared_slices/Reporting'
import { deleteReportingsFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReportings } from '../../shared_slices/Vessel'

/**
 * Delete multiple reportings
 * @param {number[]} ids - The ids of reporting to delete
 */
const deleteReportings = ids => async (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings,
    currentReportings,
    vesselIdentity
  } = getState().reporting
  const reportingsToDelete = getReportingsToDeleteObjects(ids, currentReportings)

  return deleteReportingsFromAPI(ids).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings(ids))
    dispatch(removeVesselReportings(reportingsToDelete))
    if (vesselIdentity && currentAndArchivedReportings.current?.length) {
      const reportingsToDelete = getReportingsToDeleteOfSelectedVessel(ids, currentAndArchivedReportings)

      const nextCurrentAndArchivedReporting = deleteReportingsFromSelectedVessel(currentAndArchivedReportings, reportingsToDelete)
      dispatch(setCurrentAndArchivedReportings({
        currentAndArchivedReportings: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

function getReportingsToDeleteObjects (ids, currentReportings) {
  return ids.map(id => {
    const reporting = currentReportings.find(reporting => reporting.id === id)
    if (!reporting) {
      return null
    }

    return {
      id: reporting.id,
      type: reporting.type,
      vesselId: Vessel.getVesselFeatureId(reporting),
    }
  }).filter(reporting => reporting)
}

function getReportingsToDeleteOfSelectedVessel (ids, currentAndArchivedReportings) {
  return ids.map(id => {
    const reportingToArchive = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
    if (reportingToArchive) {
      return reportingToArchive
    }
  }).filter(reporting => reporting)
}

function deleteReportingsFromSelectedVessel (currentAndArchivedReportings, reportingsToArchive) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  reportingsToArchive.forEach(reportingToArchive => {
    nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== reportingToArchive.id)
  })

  return nextCurrentAndArchivedReporting
}

export default deleteReportings
