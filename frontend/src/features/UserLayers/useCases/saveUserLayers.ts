import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { userLayersApi } from '../apis'

import type { UserLayers } from '../types'
import type { MainAppThunk } from '@store'

export const saveUserLayers =
  (userLayers: UserLayers): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(userLayersApi.endpoints.saveUserLayers.initiate(userLayers)).unwrap()
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          isFixed: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
