import { removeError, setError } from '../../../domain/shared_slices/Global'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../slice'
import { archiveReportingsFromAPI } from '../../../api/reporting'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeVesselReportings } from '../../../domain/shared_slices/Vessel'

/**
 * Archive multiple reportings
 * @param {number[]} ids - The ids of reporting to archive
 */
const archiveReportings = ids => async (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel
  const {
    currentAndArchivedReportingsOfSelectedVessel,
    currentReportings,
    vesselIdentity
  } = getState().reporting
  const archivedReportings = getArchivedReportingsFromIds(ids, currentReportings)

  return archiveReportingsFromAPI(ids).then(() => {
    dispatch(removeReportingsIdsFromCurrentReportings(ids))
    dispatch(removeVesselReportings(archivedReportings))
    if (vesselIdentity && currentAndArchivedReportingsOfSelectedVessel.current?.length) {
      const archivedReportingsOfSelectedVessel = getArchivedReportingsOfSelectedVesselFromIds(ids, currentAndArchivedReportingsOfSelectedVessel)

      const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(currentAndArchivedReportingsOfSelectedVessel, archivedReportingsOfSelectedVessel)
      dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
        currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

function getArchivedReportingsFromIds (ids, currentReportings) {
  return ids.map(id => {
    const reporting = currentReportings.find(reporting => reporting.id === id)
    if (!reporting) {
      return null
    }

    return {
      id: reporting.id,
      type: reporting.type,
      vesselFeatureId: Vessel.getVesselFeatureId(reporting),
    }
  }).filter(reporting => reporting)
}

function getArchivedReportingsOfSelectedVesselFromIds (ids, currentAndArchivedReportingsOfSelectedVessel) {
  return ids.map(id => {
    const reportingToArchive = currentAndArchivedReportingsOfSelectedVessel.current.find(reporting => reporting.id === id)
    if (reportingToArchive) {
      return reportingToArchive
    }
  }).filter(reporting => reporting)
}

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel (currentAndArchivedReportingsOfSelectedVessel, archivedReportings) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  archivedReportings.forEach(reportingToArchive => {
    nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(reporting => reporting.id !== reportingToArchive.id)
    nextCurrentAndArchivedReporting.archived = nextCurrentAndArchivedReporting.archived.concat(reportingToArchive)
  })

  return nextCurrentAndArchivedReporting
}

export default archiveReportings
