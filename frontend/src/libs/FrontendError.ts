/* eslint-disable no-console */

import { captureException, captureMessage } from '@sentry/react'

export class FrontendError extends Error {
  originalError: any | undefined

  constructor(message: string, originalError?: any) {
    super(message)

    captureMessage(message)
    if (originalError) {
      captureException(originalError)
    }

    this.originalError = originalError
  }
}
