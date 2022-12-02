import { batch } from 'react-redux'

import { deleteReportingFromAPI } from '../../../api/reporting'
import { Vessel } from '../../entities/vessel/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import {
  removeReportingsIdsFromCurrentReportings,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../shared_slices/Reporting'
import { removeVesselReporting } from '../../shared_slices/Vessel'

import type { AppDispatch, AppGetState } from '../../../store'

export const deleteReporting = id => (dispatch: AppDispatch, getState: AppGetState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { currentAndArchivedReportingsOfSelectedVessel } = getState().reporting

  const deletedReporting = currentAndArchivedReportingsOfSelectedVessel?.current.find(reporting => reporting.id === id)
  const nextCurrentAndArchivedReporting = getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
    currentAndArchivedReportingsOfSelectedVessel,
    deletedReporting
  )
  dispatch(
    setCurrentAndArchivedReportingsOfSelectedVessel({
      currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity
    })
  )

  deleteReportingFromAPI(id)
    .then(() => {
      dispatch(removeReportingsIdsFromCurrentReportings([id]))
      if (deletedReporting) {
        dispatch(
          removeVesselReporting({
            reportingType: deletedReporting.type,
            vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
          })
        )
      }
      dispatch(removeError())
    })
    .catch(error => {
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

function getUpdatedCurrentAndArchivedReportingOfSelectedVessel(
  currentAndArchivedReportingsOfSelectedVessel,
  deletedReporting
) {
  const nextCurrentAndArchivedReporting = { ...currentAndArchivedReportingsOfSelectedVessel }
  nextCurrentAndArchivedReporting.current = nextCurrentAndArchivedReporting.current.filter(
    reporting => reporting.id !== deletedReporting.id
  )

  return nextCurrentAndArchivedReporting
}
