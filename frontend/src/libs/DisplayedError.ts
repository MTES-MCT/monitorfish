/* eslint-disable no-console */

import { captureException, captureMessage } from '@sentry/react'

import type { MainAppUseCase } from '../types'

export class DisplayedError extends Error {
  originalError: any
  useCase: MainAppUseCase | undefined

  constructor(message: string, useCase: MainAppUseCase | undefined, originalError?: any) {
    super(message)

    captureMessage(message)
    if (originalError) {
      captureException(originalError)
    }

    this.originalError = originalError
    this.useCase = useCase
  }
}
