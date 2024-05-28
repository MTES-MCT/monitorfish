import { cleanMissionForm } from '@features/SideWindow/useCases/cleanMissionForm'
import { UseCaseStore } from '@store/UseCaseStore'
import { assertNotNullish } from '@utils/assertNotNullish'

import { sideWindowActions } from '../slice'

import type { MainAppThunk } from '@store'

export const confirmSideWindowDraftCancellationAndProceed = (): MainAppThunk => (dispatch, getState) => {
  const { sideWindow } = getState()
  assertNotNullish(sideWindow.nextPath)
  const pendingUseCase = UseCaseStore.get('MISSION_DRAFT_CANCELLATION_CONFIRMATION')

  if (pendingUseCase) {
    dispatch(pendingUseCase())
  }
  dispatch(sideWindowActions.closeDraftCancellationConfirmationDialog())
  dispatch(sideWindowActions.openOrFocusAndGoTo(sideWindow.nextPath))
  dispatch(cleanMissionForm())
}
