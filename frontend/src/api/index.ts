// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import { getOIDCUser } from '../auth/getOIDCUser'
import { getEnvironmentVariable } from '../utils/getEnvironmentVariable'
import { normalizeRtkBaseQuery } from '../utils/normalizeRtkBaseQuery'

// Using local MonitorEnv stubs:
const MONITORENV_API_URL = getEnvironmentVariable('VITE_MONITORENV_URL')

// Using local MonitorEnv instance:
// const MONITORENV_API_URL = 'http://0.0.0.0:9880'

// =============================================================================
// Monitorenv API

// We'll need that later on if we use any kind of authentication.
const monitorenvBaseQuery = fetchBaseQuery({
  baseUrl: `${MONITORENV_API_URL}/api/v1`
})
export const monitorenvApi = createApi({
  baseQuery: normalizeRtkBaseQuery(monitorenvBaseQuery),
  endpoints: () => ({}),
  reducerPath: 'monitorenvApi',
  tagTypes: ['ControlUnits', 'Missions']
})

// =============================================================================
// Monitorfish API

const monitorfishBaseQuery = fetchBaseQuery({
  // TODO Remove the /v1 from the baseUrl as it make harder to update APIs (vX are designed for that)
  baseUrl: `/bff/v1`,
  prepareHeaders: headers => {
    const user = getOIDCUser()
    const token = user?.access_token

    // If we have a token set in state, we pass it.
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    return headers
  }
})
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
      async ({ request, retryCount }) => {
        if (retryCount > 1) {
          throw new Error('Connexion avec le serveur impossible.')
        }

        const user = getOIDCUser()
        const token = user?.access_token

        // If we have a token set in state, we pass it.
        if (token) {
          request.headers.set('authorization', `Bearer ${token}`)
        }
      }
    ]
  }
})
