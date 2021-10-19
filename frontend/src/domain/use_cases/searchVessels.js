import { searchVesselsFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'

const searchVessels = searched => (dispatch) => {
  return searchVesselsFromAPI(searched)
    .catch(error => {
      dispatch(setError(error))
    })
}

export default searchVessels
