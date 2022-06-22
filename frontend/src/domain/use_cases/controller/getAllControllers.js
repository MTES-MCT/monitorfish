import { setError } from '../../shared_slices/Global'
import { getControllersFromAPI } from '../../../api/controller'
import { setControllers } from '../../shared_slices/Control'

const getAllControllers = () => dispatch => {
  return getControllersFromAPI().then(controllers => {
    dispatch(setControllers(controllers))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllControllers
