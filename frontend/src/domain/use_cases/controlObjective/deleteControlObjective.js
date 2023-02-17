import { setError } from '../../shared_slices/Global'
import { deleteControlObjectiveFromAPI } from '../../../api/controlObjective'

/**
 * Delete a control Objective
 * @param {number} id - The id of the control objective
 */
const deleteControlObjective = (id) => dispatch => {
  return deleteControlObjectiveFromAPI(id).catch(error => {
    dispatch(setError(error))
  })
}

export default deleteControlObjective
