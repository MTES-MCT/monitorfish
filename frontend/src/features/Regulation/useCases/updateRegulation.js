import { setProcessingRegulationSaved, setProcessingRegulationDeleted } from '../../Backoffice/slice'
import { setError } from '../../../domain/shared_slices/Global'
import { REGULATION_ACTION_TYPE } from '../utils'
import { sendRegulationTransaction } from '../../../api/geoserver'

const updateRegulation = (feature, type) => dispatch => {
  return sendRegulationTransaction(feature, type)
    .then(_ => {
      if (type === REGULATION_ACTION_TYPE.DELETE) {
        dispatch(setProcessingRegulationDeleted(true))
      } else {
        dispatch(setProcessingRegulationSaved(true))
      }
    })
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
}

export default updateRegulation
