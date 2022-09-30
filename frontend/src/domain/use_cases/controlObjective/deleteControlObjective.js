import { deleteControlObjectiveFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

/**
 * Delete a control Objective
 * @param {string} id - The id of the control objective
 */
const deleteControlObjective = id => dispatch =>
  deleteControlObjectiveFromAPI(id).catch(error => {
    dispatch(setError(error))
  })

export default deleteControlObjective
