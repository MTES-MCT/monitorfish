import { setError } from '../../shared_slices/Global'
import { searchVesselsFromAPI } from '../../../api/vessel'

const searchVessels = searched => (dispatch) => {
  return searchVesselsFromAPI(searched)
    .catch(error => {
      dispatch(setError(error))
    })
}

export default searchVessels
