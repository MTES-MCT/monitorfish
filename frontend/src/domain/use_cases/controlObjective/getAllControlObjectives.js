import { getControlObjectivesFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

const getAllControlObjectives = year => dispatch =>
  getControlObjectivesFromAPI(year)
    .then(controlObjectives => controlObjectives)
    .catch(error => {
      dispatch(setError(error))
    })

export default getAllControlObjectives
