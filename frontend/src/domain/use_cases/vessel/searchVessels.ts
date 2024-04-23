import { searchVesselsFromAPI } from '../../../api/vessel'
import { setError } from '../../../features/MainWindow/slice'

export const searchVessels = searched => dispatch =>
  searchVesselsFromAPI(searched).catch(error => {
    dispatch(setError(error))
  })
