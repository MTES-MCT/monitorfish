import { getSilencedAlertsFromAPI } from '../../../api/alert'
import { setSilencedAlerts } from '../../shared_slices/Alert'
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
