import { setError } from '../../shared_slices/Global'
import { getFAOAreasFromAPI } from '../../../api/faoAreas'

const getFAOAreas = () => dispatch => {
  return getFAOAreasFromAPI().catch(error => {
    dispatch(setError(error))
  })
}

export default getFAOAreas
