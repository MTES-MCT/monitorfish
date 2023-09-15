import { getOperationalAlertsFromAPI } from '../../../api/alert'
import { setPendingAlerts } from '../../../features/SideWindow/Alert/slice'
import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '../../../store'

export const getOperationalAlerts = (): MainAppThunk => dispatch => {
  getOperationalAlertsFromAPI()
    .then(alerts => {
      dispatch(setPendingAlerts(alerts))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
