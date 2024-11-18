import { setPendingAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { getOperationalAlertsFromAPI } from '../../../api/alert'
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
