import { removeError, setError } from '../../shared_slices/Global'
import { setCurrentReportings } from '../../shared_slices/Reporting'
import { getAllCurrentReportingsFromAPI } from '../../../api/reporting'

const getAllCurrentReportings = () => dispatch => {
  return getAllCurrentReportingsFromAPI().then(reportings => {
    dispatch(setCurrentReportings(reportings))
    dispatch(removeError())
  }).catch(error => {
    dispatch(setError(error))
  })
}
export default getAllCurrentReportings
