import { setError } from '../../shared_slices/Global'
import { setAlerts } from '../../shared_slices/Alert'
import { getOperationalAlertsFromAPI } from '../../../api/alert'

const getOperationalAlerts = () => dispatch => {
  getOperationalAlertsFromAPI().then(alerts => {
    dispatch(setAlerts(alerts))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default getOperationalAlerts
