import { setError } from '../../shared_slices/Global'
import { addControlObjectiveYearFromAPI } from '../../../api/controlObjective'

/**
 * Add a new control Objective year
 */
const addControlObjectiveYear = () => dispatch => {
  return addControlObjectiveYearFromAPI().catch(error => {
    dispatch(setError(error))
  })
}

export default addControlObjectiveYear
