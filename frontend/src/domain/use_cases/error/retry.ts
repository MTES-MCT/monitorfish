import { displayedErrorActions, type DisplayedErrorState } from '../../shared_slices/DisplayedError'

import type { RetryableUseCase } from '../../../libs/DisplayedError'
import type { MainAppThunk } from '../../../store'

export const retry =
  (errorKey: keyof DisplayedErrorState, retryableUseCase: RetryableUseCase | undefined): MainAppThunk =>
  dispatch => {
    if (!retryableUseCase) {
      return
    }

    dispatch(displayedErrorActions.unset(errorKey))
    dispatch(retryableUseCase())
  }
