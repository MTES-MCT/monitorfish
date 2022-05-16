import { setError } from '../../shared_slices/Global'
import { getControlObjectivesFromAPI } from '../../../api/controlObjective'

const getAllControlObjectives = year => dispatch => {
  return getControlObjectivesFromAPI(year).then(controlObjectives => {
    return controlObjectives
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllControlObjectives
