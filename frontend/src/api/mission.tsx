import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getEnvironmentVariable } from './api'

import type { Mission } from '../domain/types/mission'

const MONITORENV_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

export const missionApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${MONITORENV_URL}/api/v1/`
  }),
  endpoints: builder => ({
    getAll: builder.query<Mission[], undefined>({
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    })
  }),
  reducerPath: 'missionApi'
})
