import { RegulationActionType } from '@features/Regulation/utils'

import { sendRegulationTransaction } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { regulationActions } from '../../Regulation/slice'

export const updateRegulation = (feature, type) => dispatch =>
  sendRegulationTransaction(feature, type)
    .then(_ => {
      if (type === RegulationActionType.Delete) {
        dispatch(regulationActions.setProcessingRegulationDeleted(true))
      } else {
        dispatch(regulationActions.setProcessingRegulationSaved(true))
      }
    })
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
