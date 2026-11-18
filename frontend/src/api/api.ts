// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { isUnauthorizedOrForbidden } from '@api/utils'
import { FrontendApiError } from '@libs/FrontendApiError'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { normalizeRtkBaseQuery } from '@utils/normalizeRtkBaseQuery'
import ky, { HTTPError } from 'ky'

import { HttpStatusCode, RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS, RtkCacheTagType } from './constants'
import { RTK_RETRY_OPTIONS } from './retry'
import { withAttemptSpan } from './withAttemptSpan'
import { redirectToLoginIfUnauthorized } from '../auth/utils'

import type { BackendApi } from './BackendApi.types'
import type { CustomResponseError, RTKBaseQueryArgs } from './types'

// Using local MonitorEnv stubs:
export const MONITORENV_API_URL = import.meta.env.FRONTEND_MONITORENV_URL

// =============================================================================
// Monitorenv API

// We'll need that later on if we use any kind of authentication.
const monitorenvApiBaseQuery = retry(
  withAttemptSpan(
    '[Env API]',
    fetchBaseQuery({
      baseUrl: `${MONITORENV_API_URL}/api`
    })
  ),
  RTK_RETRY_OPTIONS
)

export const monitorenvApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const result = await normalizeRtkBaseQuery(monitorenvApiBaseQuery)(args, api, extraOptions)
    if (result.error) {
      const error: CustomResponseError = {
        path: typeof args === 'string' ? args : args.url,
        requestData: typeof args === 'string' ? undefined : args.body,
        responseData: result.error.data as BackendApi.ResponseBodyError,
        status: result.error.status
      }

      return { error }
    }

    return result
  },
  endpoints: () => ({}),
  reducerPath: 'monitorenvApi',
  tagTypes: ['Administrations', 'ControlUnits', 'Missions', 'Stations']
})

// =============================================================================
// Monitorfish API

export const CORRELATION_HEADER = 'x-correlation-id'
export const EMAIL_HEADER = 'email'

const monitorfishBaseQuery = retry(
  withAttemptSpan(
    '[Fish API]',
    fetchBaseQuery({
      // TODO Remove the /v1 from the baseUrl as it make harder to update APIs (vX are designed for that)
      baseUrl: `/bff/v1`,
      credentials: 'include'
    })
  ),
  RTK_RETRY_OPTIONS
)

export const monitorfishApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const result = await normalizeRtkBaseQuery(monitorfishBaseQuery)(args, api, extraOptions)
    if (result.error) {
      const error: CustomResponseError = {
        correlationId: result.meta?.response?.headers?.get(CORRELATION_HEADER) ?? undefined,
        path: `/bff/v1${typeof args === 'string' ? args : args.url}`,
        requestData: typeof args === 'string' ? undefined : args.body,
        responseData: result.error.data as BackendApi.ResponseBodyError,
        status: result.error.status
      }

      const email = result.meta?.response?.headers?.get(EMAIL_HEADER) ?? undefined
      redirectToLoginIfUnauthorized(error, email)

      return { error }
    }

    return result
  },
  endpoints: () => ({}),
  reducerPath: 'monitorfishApi',
  tagTypes: [
    ...Object.values(RtkCacheTagType),
    'ControlObjectives',
    'ControlObjectivesYears',
    'FleetSegments',
    'Gears',
    'Infractions',
    'Missions',
    'MissionActions',
    'Ports',
    'Districts',
    'PriorNotifications',
    'PriorNotificationTypes',
    'AlertSpecifications',
    'Species',
    'RiskFactor',
    'ForeignFmcs'
  ]
})

// =============================================================================
// Monitorfish Public API

const monitorfishPublicBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: `/api`
  }),
  RTK_RETRY_OPTIONS
)

export const monitorfishPublicApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const result = await normalizeRtkBaseQuery(monitorfishPublicBaseQuery)(args, api, extraOptions)
    if (result.error) {
      const error: CustomResponseError = {
        path: typeof args === 'string' ? args : args.url,
        requestData: typeof args === 'string' ? undefined : args.body,
        responseData: result.error.data as BackendApi.ResponseBodyError,
        status: result.error.status
      }

      return { error }
    }

    return result
  },
  endpoints: () => ({}),
  reducerPath: 'monitorfishPublicApi',
  tagTypes: ['Infractions']
})

export const monitorfishApiKy = ky.extend({
  credentials: 'include',
  hooks: {
    beforeError: [
      async error => {
        const { request, response } = error

        let requestData
        try {
          requestData = await request.json()
        } catch {
          // eslint-disable-next-line no-console
          console.error('Could not parse request data', error)
        }

        let responseData
        try {
          responseData = await response.json()
        } catch {
          // eslint-disable-next-line no-console
          console.error('Could not parse response data', error)
        }

        const customError: CustomResponseError = {
          path: response.url,
          requestData,
          responseData,
          status: response.status
        }
        const email = response.headers.get(EMAIL_HEADER) ?? undefined
        redirectToLoginIfUnauthorized(customError, email)

        // `beforeError` hook expect an HTTPError, so we fake it with `as unknown as HTTPError`
        return new FrontendApiError(customError.status.toString(), customError) as unknown as HTTPError
      }
    ],
    beforeRetry: [
      async ({ error }) => {
        if (error) {
          // Retry is not necessary when request is unauthorized
          if (isUnauthorizedOrForbidden((error as HTTPError).response?.status)) {
            return ky.stop
          }
        }

        return undefined
      }
    ]
  },
  retry: {
    delay: attemptCount =>
      RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS[Math.min(attemptCount, RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS.length) - 1]!,
    limit: RTK_TRANSIENT_ERROR_RETRY_DELAYS_MS.length,
    statusCodes: [HttpStatusCode.BAD_GATEWAY, HttpStatusCode.SERVICE_UNAVAILABLE, HttpStatusCode.GATEWAY_TIMEOUT]
  }
})
