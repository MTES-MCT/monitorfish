import { getVesselReportingsFromAPI } from '../../../api/vessel'
import { vesselsAreEquals } from '../../entities/vessel'
import { removeError, setError } from '../../shared_slices/Global'
import {
  loadReporting,
  resetCurrentAndArchivedReportings,
  setCurrentAndArchivedReportings,
} from '../../shared_slices/Reporting'

const getVesselReportings = () => (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel

  if (!selectedVesselIdentity) {
    return
  }

  const { archivedReportingsFromDate, currentAndArchivedReportings, vesselIdentity } = getState().reporting

  if (!currentAndArchivedReportings) {
    dispatch(loadReporting())
  }

  getVesselReportingsFromAPI(selectedVesselIdentity, archivedReportingsFromDate)
    .then(nextCurrentAndArchivedReporting => {
      dispatch(
        setCurrentAndArchivedReportings({
          currentAndArchivedReportings: nextCurrentAndArchivedReporting,
          vesselIdentity: selectedVesselIdentity,
        }),
      )
      dispatch(removeError())
    })
    .catch(error => {
      if (!vesselsAreEquals(selectedVesselIdentity, vesselIdentity)) {
        dispatch(resetCurrentAndArchivedReportings())
      }
      console.error(error)
      dispatch(setError(error))
    })
}

export default getVesselReportings
