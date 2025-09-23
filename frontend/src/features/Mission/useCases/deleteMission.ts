import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { Level } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { logSoftError } from '@utils/logSoftError'

import type { MainAppThunk } from '@store'

export const deleteMission =
  (missionId: number | undefined): MainAppThunk<Promise<boolean>> =>
  async dispatch => {
    assertNotNullish(missionId)

    try {
      await dispatch(monitorenvMissionApi.endpoints.deleteMission.initiate(missionId)).unwrap()
      dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))

      return true
    } catch (error: any) {
      logSoftError({
        callback: () =>
          dispatch(
            addSideWindowBanner({
              children: error.userMessage,
              closingDelay: 3000,
              isClosable: true,
              level: Level.ERROR,
              withAutomaticClosing: true
            })
          ),
        message: '`delete()` failed.',
        originalError: error
      })

      return false
    }
  }
