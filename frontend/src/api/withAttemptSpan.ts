import { setMeasurement, startSpan } from '@sentry/react'

import type { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type FetchBaseQuery = ReturnType<typeof fetchBaseQuery>

/** Sentry `SPAN_STATUS_ERROR` (not exported by `@sentry/react`). */
const SENTRY_SPAN_STATUS_ERROR = 2

/**
 * Traces each attempt of a retried query in its own span, so that the delays between retries are not counted as
 * request duration, and that failed attempts are flagged with their status.
 */
export function withAttemptSpan(apiName: string, baseQuery: FetchBaseQuery): FetchBaseQuery {
  return (args, api, extraOptions) => {
    const spanName = `${apiName} [RTK ${api.type.toUpperCase()}] ${api.endpoint}`

    return startSpan({ name: spanName }, async span => {
      const measurementStart = Date.now()

      const result = await baseQuery(args, api, extraOptions)

      setMeasurement(spanName, Date.now() - measurementStart, 'millisecond')
      if (result.error) {
        span.setStatus({ code: SENTRY_SPAN_STATUS_ERROR, message: String(result.error.status) })
      }

      return result
    })
  }
}
