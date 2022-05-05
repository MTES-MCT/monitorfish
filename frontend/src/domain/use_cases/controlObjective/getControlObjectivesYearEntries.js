import { setError } from '../../shared_slices/Global'
import { getControlObjectiveYearEntriesFromAPI } from '../../../api/controlObjective'

const getControlObjectivesYearEntries = () => dispatch => {
  return getControlObjectiveYearEntriesFromAPI()
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getControlObjectivesYearEntries
