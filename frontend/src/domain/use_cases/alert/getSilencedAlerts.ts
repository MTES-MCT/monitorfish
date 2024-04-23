import { getSilencedAlertsFromAPI } from '../../../api/alert'
import { setError } from '../../../features/MainWindow/slice'
import { setSilencedAlerts } from '../../../features/SideWindow/Alert/slice'

export const getSilencedAlerts = () => dispatch => {
  getSilencedAlertsFromAPI()
    .then(silencedAlerts => {
      dispatch(setSilencedAlerts(silencedAlerts))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
