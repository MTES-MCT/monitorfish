import type { MainAppUseCase } from '../types'

export enum UseCaseStoreKey {
  DRAFT_CANCELLATION_CONFIRMATION = 'DRAFT_CANCELLATION_CONFIRMATION',
  RETRYABLE_ERROR = 'RETRYABLE_ERROR'
}

const USE_CASE_STORE: Record<UseCaseStoreKey, MainAppUseCase | undefined> = {
  DRAFT_CANCELLATION_CONFIRMATION: undefined,
  RETRYABLE_ERROR: undefined
}

export class UseCaseStore {
  static get(key: UseCaseStoreKey): MainAppUseCase | undefined {
    const pendingUseCase = USE_CASE_STORE[key]

    UseCaseStore.unset(key)

    return pendingUseCase
  }

  static set(key: UseCaseStoreKey, useCase: MainAppUseCase) {
    USE_CASE_STORE[key] = useCase
  }

  static unset(key: UseCaseStoreKey) {
    USE_CASE_STORE[key] = undefined
  }
}
