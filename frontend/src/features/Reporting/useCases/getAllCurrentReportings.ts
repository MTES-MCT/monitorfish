import { getAllCurrentReportingsFromAPI } from '@api/reporting'

import { removeError, setError } from '../../../domain/shared_slices/Global'
import { mainWindowReportingActions } from '../mainWindowReporting.slice'

export const getAllCurrentReportings = () => dispatch =>
  getAllCurrentReportingsFromAPI()
    .then(reportings => {
      dispatch(mainWindowReportingActions.setCurrentReportings(reportings))
      dispatch(removeError())
    })
    .catch(error => {
      dispatch(setError(error))
    })
