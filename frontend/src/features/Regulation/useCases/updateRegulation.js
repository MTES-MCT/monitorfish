import { sendRegulationTransaction } from '../../../api/geoserver'
import { setProcessingRegulationSaved, setProcessingRegulationDeleted } from '../../Backoffice/slice'
import { setError } from '../../MainWindow/slice'
import { REGULATION_ACTION_TYPE } from '../utils'

const updateRegulation = (feature, type) => dispatch =>
  sendRegulationTransaction(feature, type)
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

export default updateRegulation
