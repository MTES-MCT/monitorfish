import { getFAOAreasFromAPI } from '../../../api/faoAreas'
import { setError } from '../../shared_slices/Global'

const getFAOAreas = () => dispatch =>
  getFAOAreasFromAPI().catch(error => {
    dispatch(setError(error))
  })

export default getFAOAreas
