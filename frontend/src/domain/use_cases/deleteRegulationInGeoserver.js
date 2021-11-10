import { regulatoryAreaTransaction } from '../../api/fetch'
import { setRegulationDeleted } from '../../features/backoffice/Regulation.slice'
import { setError } from '../shared_slices/Global'

const deleteRegulationInGeoserver = (feature, type) => (dispatch) => {
  return regulatoryAreaTransaction(feature, type)
    .then(_ => dispatch(setRegulationDeleted(true)))
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
}

export default deleteRegulationInGeoserver
