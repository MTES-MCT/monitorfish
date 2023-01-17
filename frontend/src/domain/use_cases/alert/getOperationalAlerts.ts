import { getOperationalAlertsFromAPI } from '../../../api/alert'
import { setPendingAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

import type { AppThunk } from '../../../store'

export const getOperationalAlerts = (): AppThunk => dispatch => {
  getOperationalAlertsFromAPI()
    .then(alerts => {
      dispatch(setPendingAlerts(alerts))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
