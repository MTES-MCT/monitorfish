import { sendRegulationTransaction } from '../../../api/geoserver'
import { setError } from '../../../domain/shared_slices/Global'
import { regulationActions } from '../slice'
import { RegulationActionType } from '../utils'

import type { BackofficeAppThunk } from '@store'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const updateRegulation =
  (feature: Feature<Geometry>, type: RegulationActionType): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await sendRegulationTransaction(feature, type)

      if (type === RegulationActionType.Delete) {
        dispatch(regulationActions.setProcessingRegulationDeleted(true))
      } else {
        dispatch(regulationActions.setProcessingRegulationSaved(true))
      }
    } catch (err) {
      console.error(err)
      dispatch(setError(err))
    }
  }
