import { updateControlObjectiveFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

/**
 * Update a control Objective
 * @param {string} id - The id of the control objective
 * @param {UpdateControlObjective} updatedFields - The fields to update
 */
const updateControlObjective = (id, updatedFields) => dispatch =>
  updateControlObjectiveFromAPI(id, updatedFields).catch(error => {
    dispatch(setError(error))
  })

export default updateControlObjective
