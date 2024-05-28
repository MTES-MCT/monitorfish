import { askForSideWindowDraftCancellationConfirmation } from './askForSideWindowDraftCancellationConfirmation'
import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../slice'
import { getFullPathFromPath } from '../utils'

import type { MainAppThunk } from '../../../store'
import type { SideWindow } from '../SideWindow.types'

export const openSideWindowPath =
  (path: SideWindow.Path, withoutConfirmation: boolean = false): MainAppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()

    if (
      !withoutConfirmation &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM &&
      sideWindow.status !== SideWindowStatus.CLOSED &&
      missionForm.isDraftDirty
    ) {
      await dispatch(askForSideWindowDraftCancellationConfirmation(path))

      return false
    }

    await dispatch(sideWindowActions.openOrFocusAndGoTo(getFullPathFromPath(path)))

    return true
  }
