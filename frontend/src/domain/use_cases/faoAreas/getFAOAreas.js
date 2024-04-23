import { getFAOAreasFromAPI } from '../../../api/faoAreas'
import { setError } from '../../../features/MainWindow/slice'

const getFAOAreas = () => dispatch =>
  getFAOAreasFromAPI().catch(error => {
    dispatch(setError(error))
  })

export default getFAOAreas
