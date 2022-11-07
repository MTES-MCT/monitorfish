import { removeError, setError } from '../../shared_slices/Global'
import { getVesselReportingsFromAPI } from '../../../api/vessel'
import {
  loadReporting,
  resetCurrentAndArchivedReportingsOfSelectedVessel,
  setCurrentAndArchivedReportingsOfSelectedVessel
} from '../../shared_slices/Reporting'
import { vesselsAreEquals } from '../../entities/vessel/vessel'

const getVesselReportings = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel

  if (!selectedVesselIdentity) {
    return
  }

  const {
    currentAndArchivedReportingsOfSelectedVessel,
    archivedReportingsFromDate,
    vesselIdentity
  } = getState().reporting

  if (!currentAndArchivedReportingsOfSelectedVessel) {
    dispatch(loadReporting())
  }

  getVesselReportingsFromAPI(selectedVesselIdentity, archivedReportingsFromDate).then(nextCurrentAndArchivedReporting => {
    dispatch(setCurrentAndArchivedReportingsOfSelectedVessel({
      currentAndArchivedReportingsOfSelectedVessel: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity
    }))
    dispatch(removeError())
  }).catch(error => {
    if (!vesselsAreEquals(selectedVesselIdentity, vesselIdentity)) {
      dispatch(resetCurrentAndArchivedReportingsOfSelectedVessel())
    }
    console.error(error)
    dispatch(setError(error))
  })
}

export default getVesselReportings
