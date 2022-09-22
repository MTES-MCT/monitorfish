import { getOperationalAlertsFromAPI } from '../../../api/alert'
import { setAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

import type { AppThunk } from '../../../types'

export const getOperationalAlerts = (): AppThunk => dispatch => {
  getOperationalAlertsFromAPI()
    .then(alerts => {
      dispatch(setAlerts(alerts))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
