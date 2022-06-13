import { removeError, setError } from '../../shared_slices/Global'
import { getVesselReportingsFromAPI } from '../../../api/vessel'
import {
  loadReporting,
  resetCurrentAndArchivedReportings,
  setCurrentAndArchivedReportings
} from '../../shared_slices/Reporting'
import { vesselsAreEquals } from '../../entities/vessel'

const getVesselReportings = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel

  if (!selectedVesselIdentity) {
    return
  }

  const {
    currentAndArchivedReportings,
    archivedReportingsFromDate,
    vesselIdentity
  } = getState().reporting

  if (!currentAndArchivedReportings) {
    dispatch(loadReporting())
  }

  getVesselReportingsFromAPI(selectedVesselIdentity, archivedReportingsFromDate).then(nextCurrentAndArchivedReporting => {
    dispatch(setCurrentAndArchivedReportings({
      currentAndArchivedReportings: nextCurrentAndArchivedReporting,
      vesselIdentity: selectedVesselIdentity
    }))
    dispatch(removeError())
  }).catch(error => {
    if (!vesselsAreEquals(selectedVesselIdentity, vesselIdentity)) {
      dispatch(resetCurrentAndArchivedReportings())
    }
    console.error(error)
    dispatch(setError(error))
  })
}

export default getVesselReportings
