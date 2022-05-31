import { removeError, setError } from '../../shared_slices/Global'
import { getVesselReportingFromAPI } from '../../../api/vessel'
import {
  loadReporting,
  resetCurrentAndArchivedReporting,
  setCurrentAndArchivedReporting,
  setNextCurrentAndArchivedReporting
} from '../../shared_slices/Reporting'
import { vesselsAreEquals } from '../../entities/vessel'

const getVesselReporting = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel

  if (!selectedVesselIdentity) {
    return
  }

  const {
    currentAndArchivedReporting,
    archivedReportingFromDate,
    vesselIdentity
  } = getState().reporting

  if (!currentAndArchivedReporting) {
    dispatch(loadReporting())
  }

  getVesselReportingFromAPI(selectedVesselIdentity, archivedReportingFromDate).then(nextCurrentAndArchivedReporting => {
    const isShowedAndContainsMoreCurrentReporting = vesselsAreEquals(selectedVesselIdentity, vesselIdentity) &&
      nextCurrentAndArchivedReporting.current?.length > currentAndArchivedReporting.current?.length

    if (isShowedAndContainsMoreCurrentReporting) {
      dispatch(setNextCurrentAndArchivedReporting(nextCurrentAndArchivedReporting))
    } else {
      dispatch(setCurrentAndArchivedReporting({
        currentAndArchivedReporting: nextCurrentAndArchivedReporting,
        vesselIdentity: selectedVesselIdentity
      }))
    }
    dispatch(removeError())
  }).catch(error => {
    if (!vesselsAreEquals(selectedVesselIdentity, vesselIdentity)) {
      dispatch(resetCurrentAndArchivedReporting())
    }
    console.error(error)
    dispatch(setError(error))
  })
}

export default getVesselReporting
