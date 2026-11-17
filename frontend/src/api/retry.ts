import { HttpStatusCode, RTK_MAX_RETRIES, RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS } from '@api/constants'
import { isUnauthorizedOrForbidden } from '@api/utils'

import type { BaseQueryApi, FetchBaseQueryError, RetryOptions } from '@reduxjs/toolkit/query'

const TRANSIENT_HTTP_STATUSES = new Set<number | string>([
  'FETCH_ERROR',
  'TIMEOUT_ERROR',
  HttpStatusCode.BAD_GATEWAY,
  HttpStatusCode.SERVICE_UNAVAILABLE,
  HttpStatusCode.GATEWAY_TIMEOUT
])

export function isTransientError(status: FetchBaseQueryError['status'] | undefined): boolean {
  return status !== undefined && TRANSIENT_HTTP_STATUSES.has(status)
}

export function shouldRetryRtkQuery(
  error: FetchBaseQueryError,
  {
    attempt,
    baseQueryApi,
    extraOptions
  }: { attempt: number; baseQueryApi: Pick<BaseQueryApi, 'type'>; extraOptions: unknown }
): boolean {
  if (isUnauthorizedOrForbidden(error.status)) {
    return false
  }

  const endpointMaxRetries = (extraOptions as RetryOptions | undefined)?.maxRetries
  if (endpointMaxRetries !== undefined && attempt > endpointMaxRetries) {
    return false
  }

  // A mutation may have been applied before the error: it is not retried more than before
  if (baseQueryApi.type === 'query' && isTransientError(error.status)) {
    return attempt <= RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS.length
  }

  return attempt <= RTK_MAX_RETRIES
}

export function waitBeforeRtkRetry(attempt: number): Promise<void> {
  const delayIndex = Math.min(attempt, RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS.length) - 1

  return new Promise(resolve => {
    setTimeout(resolve, RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS[delayIndex])
  })
}

export const RTK_RETRY_OPTIONS = {
  backoff: waitBeforeRtkRetry,
  retryCondition: (error: unknown, _args: unknown, options: Parameters<typeof shouldRetryRtkQuery>[1]) =>
    shouldRetryRtkQuery(error as FetchBaseQueryError, options)
}
