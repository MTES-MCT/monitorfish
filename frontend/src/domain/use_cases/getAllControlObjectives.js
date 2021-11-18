import { getControlObjectivesFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'

const getAllControlObjectives = () => dispatch => {
  return getControlObjectivesFromAPI().then(controlObjectives => {
    return controlObjectives
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllControlObjectives
