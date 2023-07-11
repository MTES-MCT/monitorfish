import { DisplayedError } from '../../../libs/DisplayedError'
import { INITIAL_STATE, setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { setError } from '../../shared_slices/Global'

import type { RetryableUseCase } from '../../../libs/DisplayedError'

/**
 * Dispatch:
 * - A toast error if the use-case was triggered by the cron
 * - A displayedError to be shown in the vessel sidebar if the use-case was triggered by the user
 */
export const displayOrLogError =
  (
    error: Error,
    retryableUseCase: RetryableUseCase | undefined,
    isFromUserAction: boolean,
    displayedErrorBoundary: string
  ) =>
  async dispatch => {
    /**
     * If the use-case was triggered by the cron, we only log an error with a Toast
     */
    if (!isFromUserAction) {
      dispatch(setError(error))

      return
    }

    /**
     * Else, the use-case was an user action, we show a fallback error UI to the user.
     * We first check if the `displayedErrorBoundary` is correct (included in the DisplayedErrorState type)
     */
    if (!Object.keys(INITIAL_STATE).includes(displayedErrorBoundary)) {
      return
    }

    const displayedError = new DisplayedError(error.message, retryableUseCase)
    dispatch(setDisplayedErrors({ [displayedErrorBoundary]: displayedError }))
  }
