import { getAllCurrentReportingsFromAPI } from '../../../api/reporting'
import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentReportings } from '../../shared_slices/Reporting'

export const getAllCurrentReportings = () => dispatch =>
  getAllCurrentReportingsFromAPI()
    .then(reportings => {
      dispatch(setCurrentReportings(reportings))
      dispatch(removeError())
    })
    .catch(error => {
      dispatch(setError(error))
    })
