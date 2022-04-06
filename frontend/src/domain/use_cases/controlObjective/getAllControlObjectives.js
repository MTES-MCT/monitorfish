import { setError } from '../../shared_slices/Global'
import { getControlObjectivesFromAPI } from '../../../api/controlObjective'

const getAllControlObjectives = () => dispatch => {
  return getControlObjectivesFromAPI().then(controlObjectives => {
    return controlObjectives
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllControlObjectives
