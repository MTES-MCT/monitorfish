import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { UseCaseStore, UseCaseStoreKey } from '../../../libs/UseCaseStore'

import type { MainAppThunk } from '../../../store'

export const cancelSideWindowDraftCancellation = (): MainAppThunk => dispatch => {
  UseCaseStore.unset(UseCaseStoreKey.DRAFT_CANCELLATION_CONFIRMATION)

  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.unsetNextPath())
}
