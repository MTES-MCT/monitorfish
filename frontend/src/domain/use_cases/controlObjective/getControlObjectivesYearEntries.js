import { getControlObjectiveYearEntriesFromAPI } from '../../../api/controlObjective'
import { setError } from '../../shared_slices/Global'

const getControlObjectivesYearEntries = () => dispatch =>
  getControlObjectiveYearEntriesFromAPI().catch(error => {
    dispatch(setError(error))
  })

export default getControlObjectivesYearEntries
