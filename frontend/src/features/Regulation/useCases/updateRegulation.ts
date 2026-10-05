import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { sendRegulationTransaction } from '../../../api/geoserver'
import { regulationActions } from '../slice'
import { RegulationActionType } from '../utils'

import type { RegulationTransaction } from '../../../api/geoserver'
import type { BackofficeAppThunk } from '@store'

export const updateRegulation =
  (transaction: RegulationTransaction, type: RegulationActionType): BackofficeAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await sendRegulationTransaction(transaction)

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
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
