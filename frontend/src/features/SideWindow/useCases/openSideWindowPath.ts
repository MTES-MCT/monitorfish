import { askForSideWindowDraftCancellationConfirmation } from './askForSideWindowDraftCancellationConfirmation'
import { SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
import type { MainAppThunk } from '../../../store'

export const openSideWindowPath =
  (path: SideWindow.Path, withoutConfirmation: boolean = false): MainAppThunk =>
  async (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()

    const fullPath: SideWindow.FullPath = getFullPathFromPath(path)

    if (!withoutConfirmation && sideWindow.status !== SideWindowStatus.CLOSED && missionForm.isDraftDirty) {
      dispatch(askForSideWindowDraftCancellationConfirmation(path))

      return
    }

    dispatch(sideWindowActions.openOrFocusAndGoTo(fullPath))
  }
