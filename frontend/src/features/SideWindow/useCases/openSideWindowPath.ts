import { askForSideWindowDraftCancellationConfirmation } from './askForSideWindowDraftCancellationConfirmation'
import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
import type { MainAppThunk } from '../../../store'

export const openSideWindowPath =
  (path: SideWindow.Path, withoutConfirmation: boolean = false): MainAppThunk =>
  async (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()

    if (
      !withoutConfirmation &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM &&
      sideWindow.status !== SideWindowStatus.CLOSED &&
      missionForm.isDraftDirty
    ) {
      dispatch(askForSideWindowDraftCancellationConfirmation(path))

      return
    }

    dispatch(sideWindowActions.openOrFocusAndGoTo(getFullPathFromPath(path)))
  }
