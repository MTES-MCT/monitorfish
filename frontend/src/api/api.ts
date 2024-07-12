// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { sha256 } from '@utils/sha256'
import ky from 'ky'

import { RTK_MAX_RETRIES, RtkCacheTagType } from './constants'
import { getOIDCConfig } from '../auth/getOIDCConfig'
import { getOIDCUser } from '../auth/getOIDCUser'
import { normalizeRtkBaseQuery } from '../utils/normalizeRtkBaseQuery'

import type { BackendApi } from './BackendApi.types'
import type { CustomRTKResponseError, RTKBaseQueryArgs } from './types'

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
    const result = await normalizeRtkBaseQuery(monitorenvApiBaseQuery)(args, api, extraOptions)
    if (result.error) {
      const error: CustomRTKResponseError = {
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

const AUTHORIZATION_HEADER = 'authorization'
const CORRELATION_HEADER = 'X-Correlation-Id'

const setAuthorizationHeader = async headers => {
  const user = getOIDCUser()
  const { IS_OIDC_ENABLED } = getOIDCConfig()
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
  { maxRetries: RTK_MAX_RETRIES }
)

export const monitorfishApi = createApi({
  baseQuery: async (args: RTKBaseQueryArgs, api, extraOptions) => {
    const result = await normalizeRtkBaseQuery(monitorfishBaseQuery)(args, api, extraOptions)
    if (result.error) {
      const error: CustomRTKResponseError = {
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
  baseQuery: normalizeRtkBaseQuery(monitorfishLightBaseQuery),
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
      const error: CustomRTKResponseError = {
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
    beforeRequest: [
      async request => {
        const { IS_OIDC_ENABLED } = getOIDCConfig()
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
      async ({ request }) => {
        const { IS_OIDC_ENABLED } = getOIDCConfig()
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
    ]
  },
  retry: RTK_MAX_RETRIES + 1
})
