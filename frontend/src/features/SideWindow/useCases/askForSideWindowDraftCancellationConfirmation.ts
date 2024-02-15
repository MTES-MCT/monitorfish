import { getFullPathFromPath } from '../../../domain/entities/sideWindow/utils'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { UseCaseStore, UseCaseStoreKey } from '../../../libs/UseCaseStore'

import type { SideWindow } from '../../../domain/entities/sideWindow/types'
import type { MainAppThunk } from '../../../store'
import type { MainAppUseCase } from '../../../types'

export const askForSideWindowDraftCancellationConfirmation =
  (nextPath: SideWindow.Path, useCase?: MainAppUseCase): MainAppThunk =>
  dispatch => {
    if (useCase) {
      UseCaseStore.set(UseCaseStoreKey.DRAFT_CANCELLATION_CONFIRMATION, useCase)
    }

    const nextFullPath = getFullPathFromPath(nextPath)

    dispatch(sideWindowActions.setNextPath(nextFullPath))
    dispatch(sideWindowActions.openDraftCancellationConfirmationDialog())
  }
