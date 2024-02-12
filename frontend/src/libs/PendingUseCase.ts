import type { RetryableUseCase } from '../types'

export enum PendingUseCaseKey {
  DRAFT_CANCELLATION_CONFIRMATION = 'DRAFT_CANCELLATION_CONFIRMATION',
  RETRYABLE_ERROR = 'RETRYABLE_ERROR'
}

const PENDING_USE_CASE_STORE: Record<PendingUseCaseKey, RetryableUseCase | undefined> = {
  DRAFT_CANCELLATION_CONFIRMATION: undefined,
  RETRYABLE_ERROR: undefined
}

export function getPendingUseCase(key: PendingUseCaseKey): RetryableUseCase | undefined {
  const pendingUseCase = PENDING_USE_CASE_STORE[key]

  unsetPendingUseCase(key)

  return pendingUseCase
}

export function setPendingUseCase(key: PendingUseCaseKey, useCase: RetryableUseCase) {
  PENDING_USE_CASE_STORE[key] = useCase
}

export function unsetPendingUseCase(key: PendingUseCaseKey) {
  PENDING_USE_CASE_STORE[key] = undefined
}
