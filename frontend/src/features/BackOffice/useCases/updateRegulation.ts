import { RegulationActionType } from '@features/Regulation/utils'

import { sendRegulationTransaction } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { backOfficeRegulationActions } from '../../Regulation/slice.backoffice'

export const updateRegulation = (feature, type) => dispatch =>
  sendRegulationTransaction(feature, type)
    .then(_ => {
      if (type === RegulationActionType.Delete) {
        dispatch(backOfficeRegulationActions.setProcessingRegulationDeleted(true))
      } else {
        dispatch(backOfficeRegulationActions.setProcessingRegulationSaved(true))
      }
    })
    .catch(e => {
      console.error(e.error)
      dispatch(setError(e))
    })
