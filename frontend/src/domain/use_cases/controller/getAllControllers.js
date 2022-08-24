import { getControllersFromAPI } from '../../../api/controller'
import { setControllers } from '../../shared_slices/Control'
import { setError } from '../../shared_slices/Global'

const getAllControllers = () => dispatch =>
  getControllersFromAPI()
    .then(controllers => {
      dispatch(setControllers([...new Set(controllers)]))
    })
    .catch(error => {
      dispatch(setError(error))
    })

export default getAllControllers
