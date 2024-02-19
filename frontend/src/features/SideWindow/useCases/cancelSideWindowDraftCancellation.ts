import { UseCaseStore } from '@store/UseCaseStore'

import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { MainAppThunk } from '@store'

export const cancelSideWindowDraftCancellation = (): MainAppThunk => dispatch => {
  UseCaseStore.unset('MISSION_DRAFT_CANCELLATION_CONFIRMATION')

  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.unsetNextPath())
}
