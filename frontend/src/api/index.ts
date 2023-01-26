// TODO Define a few basic principles on how to handle RTK cache behavior.
// https://redux-toolkit.js.org/rtk-query/usage/cache-behavior
// https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#cache-tags

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getEnvironmentVariable } from './utils'

const MONITORENV_API_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

// =============================================================================
// Monitorenv API

// We'll need that later on if we use any kind of authentication.
const monitorenvBaseQuery = fetchBaseQuery({
  baseUrl: `${MONITORENV_API_URL}/bff/v1`
})
export const monitorenvApi = createApi({
  baseQuery: monitorenvBaseQuery,
  // TODO Is this prop initialization necessary?
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
  baseQuery: monitorfishBaseQuery,
  // TODO Is this prop initialization necessary?
  endpoints: () => ({}),
  reducerPath: 'monitorfishApi',
  tagTypes: []
})
