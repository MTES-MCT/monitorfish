import { searchVesselsFromAPI } from '../../../api/vessel'
import { setError } from '../../shared_slices/Global'

const searchVessels = searched => dispatch =>
  searchVesselsFromAPI(searched).catch(error => {
    dispatch(setError(error))
  })

export default searchVessels
