import { getSilencedAlertsFromAPI } from '../../../api/alert'
import { setSilencedAlerts } from '../../../features/SideWindow/Alert/slice'
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
