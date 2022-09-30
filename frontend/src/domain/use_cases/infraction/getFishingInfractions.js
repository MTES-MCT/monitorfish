import { getFishingInfractionsFromAPI } from '../../../api/infraction'
import { setError } from '../../shared_slices/Global'
import { setInfractions } from '../../shared_slices/Infraction'

const getFishingInfractions = () => dispatch => {
  getFishingInfractionsFromAPI()
    .then(infractions => {
      dispatch(setInfractions(infractions.sort((a, b) => a.natinfCode.localeCompare(b.natinfCode))))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getFishingInfractions
