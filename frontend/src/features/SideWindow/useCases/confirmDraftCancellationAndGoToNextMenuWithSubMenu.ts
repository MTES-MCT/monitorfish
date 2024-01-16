import { missionActions } from '../../../domain/actions'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { MainAppThunk } from '../../../store'

export const confirmDraftCancellationAndGoToNextMenuWithSubMenu = (): MainAppThunk => (dispatch, getState) => {
  const { sideWindow } = getState()
  if (sideWindow.nextPath?.menu === SideWindowMenuKey.MISSION_FORM) {
    dispatch(missionActions.initializeEdition(sideWindow.nextPath.initialData))
  }

  dispatch(sideWindowActions.hideDraftCancellationConfirmationDialogAndSetNextMenuWithSubMenu())
}
