import { getAllCurrentReportingsFromAPI } from '@api/reporting'

import { removeError, setError } from '../../../domain/shared_slices/Global'
import { setCurrentReportings } from '../slice'

export const getAllCurrentReportings = () => dispatch =>
  getAllCurrentReportingsFromAPI()
    .then(reportings => {
      dispatch(setCurrentReportings(reportings))
      dispatch(removeError())
    })
    .catch(error => {
      dispatch(setError(error))
    })
