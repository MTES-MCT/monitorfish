import { getInfractionsFromAPI } from '../../../api/infraction'
import { setError } from '../../../features/MainWindow/slice'
import { setInfractions } from '../../shared_slices/Infraction'

export const getInfractions = () => dispatch => {
  getInfractionsFromAPI()
    .then(infractions => {
      dispatch(setInfractions(infractions.sort((a, b) => a.natinfCode - b.natinfCode)))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
