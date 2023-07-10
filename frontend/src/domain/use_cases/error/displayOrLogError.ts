import { DisplayedError } from '../../../libs/DisplayedError'
import { INITIAL_STATE, setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { setError } from '../../shared_slices/Global'

import type { RetryableUseCase } from '../../../libs/DisplayedError'

/**
 * Dispatch:
 * - A displayedError to be shown in the vessel sidebar if the use-case was triggered by the user
 * - A toast error if the use-case was triggered by the cron
 */
export const displayOrLogError =
  (error: Error, retryableUseCase: RetryableUseCase, isFromCron: boolean, displayedErrorBoundary: string) =>
  async dispatch => {
    if (!Object.keys(INITIAL_STATE).includes(displayedErrorBoundary)) {
      return
    }

    /**
     * If the use-case was an user action, we show a fallback error UI to the user
     */
    if (!isFromCron) {
      const displayedError = new DisplayedError(error.message, retryableUseCase)
      dispatch(setDisplayedErrors({ [displayedErrorBoundary]: displayedError }))

      return
    }

    /**
     * Else if the use-case was triggered by the cron, we only log an error with a Toast
     */
    dispatch(setError(error))
  }
