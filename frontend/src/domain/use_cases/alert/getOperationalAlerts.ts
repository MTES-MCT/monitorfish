import { getOperationalAlertsFromAPI } from '../../../api/alert'
import { setError } from '../../../features/MainWindow/slice'
import { setPendingAlerts } from '../../../features/SideWindow/Alert/slice'

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
