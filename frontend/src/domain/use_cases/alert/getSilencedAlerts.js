import { setError } from '../../shared_slices/Global'
import { setSilencedAlerts } from '../../shared_slices/Alert'
import { getSilencedAlertsFromAPI } from '../../../api/alert'

const getSilencedAlerts = () => dispatch => {
  getSilencedAlertsFromAPI().then(silencedAlerts => {
    dispatch(setSilencedAlerts(silencedAlerts))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default getSilencedAlerts
