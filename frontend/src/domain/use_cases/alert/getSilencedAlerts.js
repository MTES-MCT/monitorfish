import { getSilencedAlertsFromAPI } from '../../../api/alert'
import { setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

const getSilencedAlerts = () => dispatch => {
  getSilencedAlertsFromAPI()
    .then(silencedAlerts => {
      dispatch(setSilencedAlerts(silencedAlerts))
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
}

export default getSilencedAlerts
