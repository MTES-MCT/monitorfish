/* eslint-disable no-console */
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { Scope } from '@sentry/react'

import { FrontendError } from './FrontendError'

import type { CustomResponseError } from '@api/types'
import type { MainAppDispatch } from '@store'

/**
 * Unexpected error handled in Frontend API code.
 */
export class FrontendApiError extends FrontendError {
  constructor(
    /** User-friendly message expliciting which operation failed. */
    public userMessage: string,
    originalError: CustomResponseError
  ) {
    super(userMessage, originalError)

    this.name = 'FrontendApiError'
  }

  // eslint-disable-next-line class-methods-use-this
  override get scope() {
    const scope = new Scope()
    scope.setTags({
      correlationId: this.originalError.correlationId,
      side: 'frontend',
      type: 'api_error'
    })

    return scope
  }

  /**
   * Handle `FrontendApiError` RTP query/mutation error
   * by dispatching a banner if any.
   */
  // TODO Temporary solution until we finalize the general error handling proposal.
  static handleIfAny(
    // TODO Find a way to correctly infer custom errors in Redux RTK.
    // This error can only be `FrontendApiError` but we use `any` in the meantime.
    errorOrResponse: any,
    dispatch: MainAppDispatch,
    /** Should the error be displayed in the side-windows? */
    isSideWindowError: boolean = false
  ) {
    if (!errorOrResponse || 'data' in errorOrResponse) {
      return
    }

    const error = 'error' in errorOrResponse ? errorOrResponse.error : errorOrResponse

    if ('userMessage' in error) {
      console.log('FrontendApiError.handleIfAny', { error, isSideWindowError })
      if (isSideWindowError) {
        dispatch(
          addSideWindowBanner({
            children: error.userMessage,
            closingDelay: 6000,
            isClosable: true,
            level: Level.ERROR,
            withAutomaticClosing: true
          })
        )

        return
      }

      dispatch(
        addMainWindowBanner({
          children: error.userMessage,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )

      return
    }

    // Extra safety check. This should never happen.
    throw new FrontendError('Unexpected error.', error)
  }
}
