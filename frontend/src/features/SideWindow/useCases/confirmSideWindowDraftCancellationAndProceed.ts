import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { UseCaseStore, UseCaseStoreKey } from '../../../libs/UseCaseStore'
import { assertNotNullish } from '../../../utils/assertNotNullish'

import type { MainAppThunk } from '../../../store'

export const confirmSideWindowDraftCancellationAndProceed = (): MainAppThunk => (dispatch, getState) => {
  const { sideWindow } = getState()
  assertNotNullish(sideWindow.nextPath)
  const pendingUseCase = UseCaseStore.get(UseCaseStoreKey.DRAFT_CANCELLATION_CONFIRMATION)

  if (pendingUseCase) {
    dispatch(pendingUseCase())
  }
  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.openOrFocusAndGoTo(sideWindow.nextPath))
}
