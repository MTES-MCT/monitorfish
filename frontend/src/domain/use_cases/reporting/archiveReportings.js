import { removeError, setError } from '../../shared_slices/Global'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportings
} from '../../shared_slices/Reporting'
import { archiveReportingsFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel'
import { removeVesselReportings } from '../../shared_slices/Vessel'

/**
 * Archive multiple reportings
 * @param {number[]} ids - The ids of reporting to archive
 */
const archiveReportings = ids => async (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportings,
    currentReportings,
    vesselIdentity
  } = getState().reporting
  const reportingsToArchive = getReportingsToArchiveObjects(ids, currentReportings)

  return archiveReportingsFromAPI(ids).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings(ids))
    dispatch(removeVesselReportings(reportingsToArchive))
    if (vesselIdentity && currentAndArchivedReportings.current?.length) {
      const reportingsToArchive = getReportingsToArchiveOfSelectedVessel(ids, currentAndArchivedReportings)

      const nextCurrentAndArchivedReporting = moveReportingsToArchived(currentAndArchivedReportings, reportingsToArchive)
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

function getReportingsToArchiveObjects (ids, currentReportings) {
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

function getReportingsToArchiveOfSelectedVessel (ids, currentAndArchivedReportings) {
  return ids.map(id => {
    const reportingToArchive = currentAndArchivedReportings.current.find(reporting => reporting.id === id)
    if (reportingToArchive) {
      return reportingToArchive
    }
  }).filter(reporting => reporting)
}

function moveReportingsToArchived (currentAndArchivedReportings, reportingsToArchive) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportings }
  reportingsToArchive.forEach(reportingToArchive => {
    nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== reportingToArchive.id)
    nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(reportingToArchive)
  })

  return nextCurrentAndArchivedReporting
}

export default archiveReportings
