import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { PendingUseCaseKey, unsetPendingUseCase } from '../../../libs/PendingUseCase'

import type { MainAppThunk } from '../../../store'

export const cancelSideWindowDraftCancellation = (): MainAppThunk => dispatch => {
  unsetPendingUseCase(PendingUseCaseKey.DRAFT_CANCELLATION_CONFIRMATION)

  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.unsetNextPath())
}
