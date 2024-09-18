import { askForSideWindowDraftCancellationConfirmation } from './askForSideWindowDraftCancellationConfirmation'
import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../slice'
import { getFullPathFromPath } from '../utils'

import type { MainAppThunk } from '../../../store'
import type { SideWindow } from '../SideWindow.types'

export const openSideWindowPath =
  (path: SideWindow.Path, withoutConfirmation: boolean = false): MainAppThunk<boolean> =>
  (dispatch, getState) => {
    const { missionForm, sideWindow } = getState()

    if (
      !withoutConfirmation &&
      sideWindow.selectedPath.menu === SideWindowMenuKey.MISSION_FORM &&
      sideWindow.status !== SideWindowStatus.CLOSED &&
      missionForm.isDraftDirty
    ) {
      dispatch(askForSideWindowDraftCancellationConfirmation(path))

      return false
    }

    dispatch(sideWindowActions.openOrFocusAndGoTo(getFullPathFromPath(path)))

    if (sideWindow.status === SideWindowStatus.CLOSED && !window.location.href.includes('side_window')) {
      window.open('/side_window', 'MonitorFish', `height=1200,width=${window.innerWidth}`)
    }

    return true
  }
