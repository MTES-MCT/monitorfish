import { UseCaseStore } from '@store/UseCaseStore'

import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
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
