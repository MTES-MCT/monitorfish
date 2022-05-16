import { setError } from '../../shared_slices/Global'
import { addControlObjectiveFromAPI } from '../../../api/controlObjective'

/**
 * Add a control Objective
 * @param {string} segment - The segment of the control objective
 * @param {string} facade - The facade of the control objective
 * @param {int} year - The year of the control objective
 */
const addControlObjective = (segment, facade, year) => dispatch => {
  return addControlObjectiveFromAPI(segment, facade, year).catch(error => {
    dispatch(setError(error))
  })
}

export default addControlObjective
