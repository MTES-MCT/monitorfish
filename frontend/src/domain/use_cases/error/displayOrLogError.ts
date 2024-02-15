import { DisplayedError } from '../../../libs/DisplayedError'
import { INITIAL_STATE, type DisplayedErrorState, displayedErrorActions } from '../../shared_slices/DisplayedError'
import { setError } from '../../shared_slices/Global'

import type { RetryableUseCase } from '../../../types'

/**
 * Dispatch:
 * - A toast error if the use-case was triggered by the cron
 * - A displayedError to be shown in the vessel sidebar if the use-case was triggered by the user
 */
export const displayOrLogError =
  (
    error: any,
    retryableUseCase: RetryableUseCase | undefined,
    isFromUserAction: boolean,
    errorBoundaryKey: keyof DisplayedErrorState
  ) =>
  async dispatch => {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)

    /**
     * If the use-case was triggered by the cron, we only log an error with a Toast
     */
    if (!isFromUserAction) {
      dispatch(setError(errorMessage))

      return
    }

    /**
     * Else, the use-case was an user action, we show a fallback error UI to the user.
     * We first check if the `displayedErrorBoundary` is correct (included in the DisplayedErrorState type)
     */
    if (!Object.keys(INITIAL_STATE).includes(errorBoundaryKey)) {
      return
    }

    const displayedError = new DisplayedError(errorMessage, retryableUseCase)
    dispatch(displayedErrorActions.set({ [errorBoundaryKey]: displayedError }))
  }
