/* eslint-disable no-console */

import { captureException, captureMessage } from '@sentry/react'

import type { RetryableUseCase } from '../types'

export class DisplayedError extends Error {
  originalError: any | undefined
  useCase: RetryableUseCase | undefined

  constructor(message: string, useCase: RetryableUseCase | undefined, originalError?: any) {
    super(message)

    captureMessage(message)
    if (originalError) {
      captureException(originalError)
    }

    this.originalError = originalError
    this.useCase = useCase
  }
}
