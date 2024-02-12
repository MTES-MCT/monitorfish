import { displayedErrorActions, type DisplayedErrorState } from '../../shared_slices/DisplayedError'

import type { MainAppThunk } from '../../../store'
import type { RetryableUseCase } from '../../../types'

export const retry =
  (errorKey: keyof DisplayedErrorState, retryableUseCase: RetryableUseCase | undefined): MainAppThunk =>
  dispatch => {
    if (!retryableUseCase) {
      return
    }

    dispatch(displayedErrorActions.unset(errorKey))
    dispatch(retryableUseCase())
  }
