import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { getSilencedAlertsFromAPI } from '../../../api/alert'
import { setError } from '../../shared_slices/Global'

export const getSilencedAlerts = () => dispatch => {
  getSilencedAlertsFromAPI()
    .then(silencedAlerts => {
      dispatch(setSilencedAlerts(silencedAlerts))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
