import { UseCaseStore } from '@store/UseCaseStore'

import { sideWindowActions } from '../slice'
import { getFullPathFromPath } from '../utils'

import type { SideWindow } from '../SideWindow.types'
import type { MainAppThunk, MainAppUseCase } from '@store'

export const askForSideWindowDraftCancellationConfirmation =
  (nextPath: SideWindow.Path, pendingUseCase?: MainAppUseCase): MainAppThunk =>
  dispatch => {
    if (pendingUseCase) {
      UseCaseStore.set('MISSION_DRAFT_CANCELLATION_CONFIRMATION', pendingUseCase)
    }

    const nextFullPath = getFullPathFromPath(nextPath)

    dispatch(sideWindowActions.setNextPath(nextFullPath))
    dispatch(sideWindowActions.openDraftCancellationConfirmationDialog())
  }
