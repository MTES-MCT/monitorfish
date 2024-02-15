import { captureException, captureMessage } from '@sentry/react'

import { UseCaseStore } from '../UseCaseStore'

import type { DisplayedErrorKey } from './constants'
import type { MainAppUseCase } from '../../types'
import type { MainRootState } from '@store/index'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

export class DisplayedError extends Error {
  hasRetryableUseCase: boolean
  originalError: any

  constructor(
    key: DisplayedErrorKey,
    message: string,
    retryableUseCase: MainAppUseCase | undefined,
    originalError?: any
  ) {
    super(message)

    captureMessage(message)
    if (originalError) {
      captureException(originalError)
    }

    this.originalError = originalError
    this.hasRetryableUseCase = !!retryableUseCase

    if (retryableUseCase) {
      UseCaseStore.set(key, retryableUseCase)
    }
  }

  static retryUseCase(dipatch: ThunkDispatch<MainRootState, undefined, AnyAction>, key: DisplayedErrorKey) {
    const retryableUseCase = UseCaseStore.get(key)

    if (retryableUseCase) {
      dipatch(retryableUseCase())
    }
  }
}
