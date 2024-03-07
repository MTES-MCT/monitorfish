import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { logSoftError } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'

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
        isSideWindowError: true,
        message: '`delete()` failed.',
        originalError: error,
        userMessage: error.userMessage
      })

      return false
    }
  }
