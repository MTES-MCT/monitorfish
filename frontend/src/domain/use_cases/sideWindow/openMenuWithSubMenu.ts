import { SideWindowStatus, type SideWindowMenuKey } from '../../entities/sideWindow/constants'
import { sideWindowActions } from '../../shared_slices/SideWindow'

import type { MainAppThunk } from '../../../store'

export const openMenuWithSubMenu =
  (menu: SideWindowMenuKey /** , maybeSubMenu?: string */): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { mission, sideWindow } = getState()

    // Set the default `subMenu` is it's undefined
    // const subMenu = maybeSubMenu || 'TO_FILL'

    if (sideWindow.status !== SideWindowStatus.CLOSED && mission.isDraftDirty) {
      return dispatch(sideWindowActions.askForDraftCancellationConfirmationBeforeGoingTo({ menu }))
    }

    return dispatch(sideWindowActions.openOrFocusAndGoTo({ menu }))
  }
