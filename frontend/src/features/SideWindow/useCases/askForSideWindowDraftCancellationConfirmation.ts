import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { PendingUseCaseKey, setPendingUseCase } from '../../../libs/PendingUseCase'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
import type { MainAppThunk } from '../../../store'
import type { RetryableUseCase } from '../../../types'

export const askForSideWindowDraftCancellationConfirmation =
  (nextPath: SideWindow.Path, useCase?: RetryableUseCase): MainAppThunk =>
  dispatch => {
    if (useCase) {
      setPendingUseCase(PendingUseCaseKey.DRAFT_CANCELLATION_CONFIRMATION, useCase)
    }

    const nextFullPath = getFullPathFromPath(nextPath)

    dispatch(sideWindowActions.setNextPath(nextFullPath))
    dispatch(sideWindowActions.openDraftCancellationConfirmationDialog())
  }
