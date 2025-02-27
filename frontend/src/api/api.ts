// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { isUnauthorizedOrForbidden } from '@api/utils'
import { FrontendApiError } from '@libs/FrontendApiError'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { setMeasurement, startSpan } from '@sentry/react'
import { normalizeRtkBaseQuery } from '@utils/normalizeRtkBaseQuery'
import { sha256 } from '@utils/sha256'
import ky, { HTTPError } from 'ky'

import { RTK_MAX_RETRIES, RtkCacheTagType } from './constants'
import { getOIDCConfig } from '../auth/getOIDCConfig'
import { getOIDCUser } from '../auth/getOIDCUser'
import { redirectToLoginIfUnauthorized } from '../auth/utils'

import type { BackendApi } from './BackendApi.types'
import type { CustomResponseError, RTKBaseQueryArgs } from './types'
import type { BaseQueryError } from '@reduxjs/toolkit/query'

// Using local MonitorEnv stubs:
export const MONITORENV_API_URL = import.meta.env.FRONTEND_MONITORENV_URL

// =============================================================================
// Monitorenv API

// We'll need that later on if we use any kind of authentication.
const monitorenvApiBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: `${MONITORENV_API_URL}/api`
  }),
  { maxRetries: RTK_MAX_RETRIES }
)

export const monitorenvApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const spanName = `[Env API] [RTK ${api.type.toUpperCase()}] ${api.endpoint}`

    return startSpan({ name: spanName }, async () => {
      const measurementStart = Date.now()

      const result = await normalizeRtkBaseQuery(monitorenvApiBaseQuery)(args, api, extraOptions)

      setMeasurement(spanName, Date.now() - measurementStart, 'millisecond')

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
    })
  },
  endpoints: () => ({}),
  reducerPath: 'monitorenvApi',
  tagTypes: ['Administrations', 'ControlUnits', 'Missions', 'Stations']
})

// =============================================================================
// Monitorfish API

export const AUTHORIZATION_HEADER = 'authorization'
export const CORRELATION_HEADER = 'x-correlation-id'
export const EMAIL_HEADER = 'email'
const { IS_OIDC_ENABLED } = getOIDCConfig()

const setAuthorizationHeader = async headers => {
  const user = getOIDCUser()
  const token = user?.access_token

  // If we have a token set in state, we pass it.
  if (IS_OIDC_ENABLED && token) {
    headers.set(AUTHORIZATION_HEADER, `Bearer ${token}`)

    if (crypto?.subtle) {
      const hashedToken = await sha256(token)

      headers.set(CORRELATION_HEADER, hashedToken)
    }
  }

  return headers
}

const monitorfishBaseQuery = retry(
  fetchBaseQuery({
    // TODO Remove the /v1 from the baseUrl as it make harder to update APIs (vX are designed for that)
    baseUrl: `/bff/v1`,
    prepareHeaders: setAuthorizationHeader
  }),
  {
    retryCondition: (error: BaseQueryError<BaseQueryError<any>>, _, { attempt }) => {
      if (attempt > RTK_MAX_RETRIES) {
        return false
      }

      return !isUnauthorizedOrForbidden(error.status)
    }
  }
)

export const monitorfishApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const spanName = `[Fish API] [RTK ${api.type.toUpperCase()}] ${api.endpoint}`

    return startSpan({ name: spanName }, async () => {
      const measurementStart = Date.now()

      const result = await normalizeRtkBaseQuery(monitorfishBaseQuery)(args, api, extraOptions)

      setMeasurement(spanName, Date.now() - measurementStart, 'millisecond')

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
    })
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
    'PriorNotifications',
    'PriorNotificationTypes',
    'Species',
    'RiskFactor',
    'ForeignFmcs',
    'TripNumbers'
  ]
})

// =============================================================================
// Monitorfish Light API

const monitorfishLightBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: `/light`,
    prepareHeaders: setAuthorizationHeader
  }),
  { maxRetries: RTK_MAX_RETRIES }
)

export const monitorfishLightApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const result = await normalizeRtkBaseQuery(monitorfishLightBaseQuery)(args, api, extraOptions)
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
  reducerPath: 'monitorfishLightApi',
  tagTypes: []
})

// =============================================================================
// Monitorfish Public API

const monitorfishPublicBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: `/api`
  }),
  { maxRetries: RTK_MAX_RETRIES }
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
  hooks: {
    beforeError: [
      async error => {
        const { request, response } = error

        let requestData
        try {
          requestData = await request.json()
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Could not parse request data', error)
        }

        let responseData
        try {
          responseData = await response.json()
        } catch (e) {
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
    beforeRequest: [
      async request => {
        const user = getOIDCUser()
        const token = user?.access_token

        // If we have a token set in state, we pass it.
        if (IS_OIDC_ENABLED && token) {
          request.headers.set(AUTHORIZATION_HEADER, `Bearer ${token}`)

          if (crypto?.subtle) {
            const hashedToken = await sha256(token)

            request.headers.set(CORRELATION_HEADER, hashedToken)
          }
        }
      }
    ],
    beforeRetry: [
      async ({ error, request }) => {
        if (error) {
          // Retry is not necessary when request is unauthorized
          if (isUnauthorizedOrForbidden((error as HTTPError).response?.status)) {
            return ky.stop
          }
        }

        const user = getOIDCUser()
        const token = user?.access_token

        // If we have a token set in state, we pass it.
        if (IS_OIDC_ENABLED && token) {
          request.headers.set(AUTHORIZATION_HEADER, `Bearer ${token}`)

          if (crypto?.subtle) {
            const hashedToken = await sha256(token)

            request.headers.set(CORRELATION_HEADER, hashedToken)
          }
        }

        return undefined
      }
    ]
  },
  retry: RTK_MAX_RETRIES
})
