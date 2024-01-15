import { missionActions } from '../../../domain/actions'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'

import type { MainAppThunk } from '../../../store'

export const editMission =
  (id: number): MainAppThunk =>
  dispatch => {
    dispatch(missionActions.initializeEdition())
    dispatch(
      sideWindowDispatchers.openPath({
        id,
        menu: SideWindowMenuKey.MISSION_FORM
      })
    )
  }
