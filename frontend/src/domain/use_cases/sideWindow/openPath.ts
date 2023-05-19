import { SideWindowStatus } from '../../entities/sideWindow/constants'
import { sideWindowActions } from '../../shared_slices/SideWindow'

import type { MainAppThunk } from '../../../store'
import type { SideWindow } from '../../entities/sideWindow/types'

export const openPath =
  (path: SideWindow.Path): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { mission, sideWindow } = getState()

    // Set the default `subMenu` is it's undefined
    // const subMenu = maybeSubMenu || 'TO_FILL'

    if (sideWindow.status !== SideWindowStatus.CLOSED && mission.isDraftDirty) {
      dispatch(sideWindowActions.askForDraftCancellationConfirmationBeforeGoingTo(path))

      return
    }

    dispatch(sideWindowActions.openOrFocusAndGoTo(path))
  }
