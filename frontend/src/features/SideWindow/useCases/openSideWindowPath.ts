// import { SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
import type { MainAppThunk } from '../../../store'

export const openSideWindowPath =
  (path: SideWindow.Path): MainAppThunk =>
  async dispatch => {
    // const { missionForm, sideWindow } = getState()

    const fullPath: SideWindow.FullPath = getFullPathFromPath(path)

    // if (sideWindow.status !== SideWindowStatus.CLOSED && missionForm.isDraftDirty) {
    //   dispatch(sideWindowActions.askForDraftCancellationConfirmationBeforeGoingTo(fullPath))

    //   return
    // }

    dispatch(sideWindowActions.openOrFocusAndGoTo(fullPath))
  }
