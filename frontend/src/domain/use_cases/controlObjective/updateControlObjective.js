import { setError } from '../../shared_slices/Global'
import { updateControlObjectiveFromAPI } from '../../../api/controlObjective'

/**
 * Update a control Objective
 * @param {number} id - The id of the control objective
 * @param {UpdateControlObjective} updatedFields - The fields to update
 */
const updateControlObjective = (id, updatedFields) => dispatch => {
  return updateControlObjectiveFromAPI(id, updatedFields).catch(error => {
    dispatch(setError(error))
  })
}

export default updateControlObjective
