/* eslint-disable no-console */

import { Scope } from '@sentry/react'

import { FrontendError } from './FrontendError'

import type { CustomRTKErrorResponse } from '../api/types'

/**
 * Unexpected error handled in Frontend API code.
 */
export class FrontendApiError extends FrontendError {
  constructor(
    /** Technical error message for logs and debugging purpose. */
    public override message: string,
    /** Frontend response object (as interpreted by the fetching lib). */
    public response: CustomRTKErrorResponse
  ) {
    const scope = new Scope()
    scope.setTags({
      side: 'frontend',
      type: 'api_error'
    })
    scope.setExtra('response', response)

    super(message, undefined, scope)
  }
}
