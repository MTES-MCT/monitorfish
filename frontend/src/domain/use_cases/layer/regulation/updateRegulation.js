import { sendRegulationTransaction } from '../../../../api/geoserver'
import {
  setProcessingRegulationSaved,
  setProcessingRegulationDeleted,
} from '../../../../features/backoffice/Regulation.slice'
import { REGULATION_ACTION_TYPE } from '../../../entities/regulatory'
import { setError } from '../../../shared_slices/Global'

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
