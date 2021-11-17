import { regulatoryAreaTransaction } from '../../api/fetch'
import { setRegulationSaved, setRegulationDeleted } from '../../features/backoffice/Regulation.slice'
import { setError } from '../shared_slices/Global'
import { REGULATION_ACTION_TYPE } from '../entities/regulatory'

const manageRegulationInGeoserver = (feature, type) => (dispatch) => {
  return regulatoryAreaTransaction(feature, type)
    .then(_ => {
      if (type === REGULATION_ACTION_TYPE.DELETE) {
        dispatch(setRegulationDeleted(true))
      } else {
        dispatch(setRegulationSaved(true))
      }
    })
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
}

export default manageRegulationInGeoserver
