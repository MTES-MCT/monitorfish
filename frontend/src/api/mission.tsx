import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { Mission } from '../domain/types/mission'

export const missionApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8081/api/v1/'
  }),
  endpoints: builder => ({
    getAll: builder.query<Mission[], undefined>({
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    })
  }),
  reducerPath: 'missionApi'
})
