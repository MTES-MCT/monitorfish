import { removeError, setError } from '../../shared_slices/Global'
import { batch } from 'react-redux'
import { getVesselReportingFromAPI } from '../../../api/vessel'
import {
  loadReporting,
  setCurrentAndArchivedReporting,
  setNextCurrentAndArchivedReporting
} from '../../shared_slices/Reporting'

const getVesselReporting = () => (dispatch, getState) => {
  const {
    selectedVesselIdentity
  } = getState().vessel

  const {
    currentAndArchivedReporting,
    archivedReportingFromDate
  } = getState().reporting

  if (!currentAndArchivedReporting) {
    dispatch(loadReporting())
  }

  getVesselReportingFromAPI(selectedVesselIdentity, archivedReportingFromDate).then(nextCurrentAndArchivedReporting => {
    const isShowedAndContainsMoreCurrentReporting = currentAndArchivedReporting &&
      nextCurrentAndArchivedReporting.current?.length > currentAndArchivedReporting.current?.length

    if (isShowedAndContainsMoreCurrentReporting) {
      dispatch(setNextCurrentAndArchivedReporting(nextCurrentAndArchivedReporting))
    } else {
      dispatch(setCurrentAndArchivedReporting(nextCurrentAndArchivedReporting))
    }
    dispatch(removeError())
  }).catch(error => {
    console.error(error)
    batch(() => {
      dispatch(setError(error))
    })
  })
}

export default getVesselReporting
