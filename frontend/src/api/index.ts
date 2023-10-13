// TODO Define a few basic principles on how to handle RTK cache behavior.
// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import { getEnvironmentVariable } from './utils'
import { getOIDCUser } from '../auth/getOIDCUser'
import { normalizeRtkBaseQuery } from '../utils/normalizeRtkBaseQuery'

const MAX_RETRIES = 2

// Using local MonitorEnv stubs:
const MONITORENV_API_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

// Using local MonitorEnv instance:
// const MONITORENV_API_URL = 'http://0.0.0.0:9880'

// =============================================================================
// Monitorenv API

// We'll need that later on if we use any kind of authentication.
const monitorenvBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: `${MONITORENV_API_URL}/api/v1`
  }),
  { maxRetries: MAX_RETRIES }
)

export const monitorenvApi = createApi({
  baseQuery: normalizeRtkBaseQuery(monitorenvBaseQuery),
  endpoints: () => ({}),
  reducerPath: 'monitorenvApi',
  tagTypes: ['ControlUnits', 'Missions']
})

// =============================================================================
// Monitorfish API

const setAuthorizationHeader = headers => {
  const user = getOIDCUser()
  const token = user?.access_token

  // If we have a token set in state, we pass it.
  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }

  return headers
}

const monitorfishBaseQuery = retry(
  fetchBaseQuery({
    // TODO Remove the /v1 from the baseUrl as it make harder to update APIs (vX are designed for that)
    baseUrl: `/bff/v1`,
    prepareHeaders: setAuthorizationHeader
  }),
  { maxRetries: MAX_RETRIES }
)

export const monitorfishApi = createApi({
  baseQuery: normalizeRtkBaseQuery(monitorfishBaseQuery),
  endpoints: () => ({}),
  reducerPath: 'monitorfishApi',
  tagTypes: [
    'ControlObjectives',
    'FleetSegments',
    'Gears',
    'Infractions',
    'Missions',
    'MissionActions',
    'Ports',
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
  { maxRetries: MAX_RETRIES }
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
  { maxRetries: MAX_RETRIES }
)

export const monitorfishPublicApi = createApi({
  baseQuery: normalizeRtkBaseQuery(monitorfishPublicBaseQuery),
  endpoints: () => ({}),
  reducerPath: 'monitorfishPublicApi',
  tagTypes: ['Infractions']
})

export const monitorfishApiKy = ky.extend({
  hooks: {
    beforeRequest: [
      request => {
        const user = getOIDCUser()
        const token = user?.access_token

        // If we have a token set in state, we pass it.
        if (token) {
          request.headers.set('authorization', `Bearer ${token}`)
        }
      }
    ],
    beforeRetry: [
      async ({ request }) => {
        const user = getOIDCUser()
        const token = user?.access_token

        // If we have a token set in state, we pass it.
        if (token) {
          request.headers.set('authorization', `Bearer ${token}`)
        }
      }
    ]
  },
  retry: MAX_RETRIES + 1
})
