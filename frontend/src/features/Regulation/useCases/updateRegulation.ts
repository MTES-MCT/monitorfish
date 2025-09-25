import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { sendRegulationTransaction } from '../../../api/geoserver'
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
      dispatch(
        addMainWindowBanner({
          children: (err as Error).message,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
