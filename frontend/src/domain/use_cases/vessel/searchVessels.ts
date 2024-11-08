import { searchVesselsFromAPI } from '../../../api/vessel'
import { setError } from '../../shared_slices/Global'

/** @deprecated Use Redux RTK `searchVessels()` query. */
export const searchVessels = searched => dispatch =>
  searchVesselsFromAPI(searched).catch(error => {
    dispatch(setError(error))
  })
