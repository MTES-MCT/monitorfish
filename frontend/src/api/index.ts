// TODO Define a few basic principles on how to handle RTK cache behavior.
// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getEnvironmentVariable } from './utils'
import { normalizeRtkBaseQuery } from '../utils/normalizeRtkBaseQuery'

// Using local MonitorEnv stubs:
const MONITORENV_API_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

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

// We'll need that later on if we use any kind of authentication.
const monitorfishBaseQuery = fetchBaseQuery({
  baseUrl: `/bff/v1`
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
    'RiskFactor'
  ]
})
