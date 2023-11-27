/* eslint-disable no-console */

import { Scope } from '@sentry/react'

import { FrontendError } from './FrontendError'
import { UsageError } from './UsageError'
import { NotifierEvent } from '../components/Notifier/NotifiierEvent'

import type { CustomRTKResponseError } from '../api/types'

/**
 * Unexpected error handled in Frontend API code.
 */
export class FrontendApiError extends FrontendError {
  constructor(
    /** User-friendly message expliciting which operation failed. */
    public userMessage: string,
    originalError: CustomRTKResponseError
  ) {
    super(userMessage, originalError)

    this.name = 'FrontendApiError'
  }

  // eslint-disable-next-line class-methods-use-this
  override get scope() {
    const scope = new Scope()
    scope.setTags({
      side: 'frontend',
      type: 'api_error'
    })

    return scope
  }

  /**
   * Handle `FrontendApiError` and `UsageError` RTP query/mutation error
   * by dispatching a toast or a dialog if any.
   */
  // TODO Temporary solution until we finalize the general error handling proposal.
  static handleIfAny(
    // TODO Find a way to correctly infer custom errors in Redux RTK.
    // This error can only be `FrontendApiError` or `UsageError` but we use `any` in the meantime.
    errorOrResponse: any,
    /** Should the error be displayed in the side-windows? */
    isSideWindowError: boolean = false
  ) {
    if (!errorOrResponse || 'data' in errorOrResponse) {
      return
    }

    const error = 'error' in errorOrResponse ? errorOrResponse.error : errorOrResponse

    if ('userMessage' in error) {
      const isDialogError = error instanceof UsageError

      window.document.dispatchEvent(new NotifierEvent(error.userMessage, 'error', isDialogError, isSideWindowError))

      return
    }

    // Extra safety check. This should never happen.
    throw new FrontendError('Unexpected RTK error.', error)
  }
}
