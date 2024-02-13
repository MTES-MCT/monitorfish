import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { getPendingUseCase, PendingUseCaseKey } from '../../../libs/PendingUseCase'
import { assert } from '../../../utils/assert'

import type { MainAppThunk } from '../../../store'

export const confirmSideWindowDraftCancellationAndProceed = (): MainAppThunk => (dispatch, getState) => {
  const { sideWindow } = getState()
  assert(sideWindow.nextPath, 'sideWindow.nextPath')
  const pendingUseCase = getPendingUseCase(PendingUseCaseKey.DRAFT_CANCELLATION_CONFIRMATION)

  if (pendingUseCase) {
    dispatch(pendingUseCase())
  }
  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.openOrFocusAndGoTo(sideWindow.nextPath))
}
