import { sendRegulationTransaction } from '../../api/fetch'
import { setRegulationSaved, setRegulationDeleted } from '../../features/backoffice/Regulation.slice'
import { setError } from '../shared_slices/Global'
import { REGULATION_ACTION_TYPE } from '../entities/regulatory'

const updateRegulation = (feature, type) => (dispatch) => {
  return sendRegulationTransaction(feature, type)
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

export default updateRegulation
