import { addControlObjectiveYearFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

/**
 * Add a new control Objective year
 */
const addControlObjectiveYear = () => dispatch =>
  addControlObjectiveYearFromAPI().catch(error => {
    dispatch(setError(error))
  })

export default addControlObjectiveYear
