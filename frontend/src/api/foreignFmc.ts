import { monitorfishApi } from './api'

import type { ForeignFmc } from '../domain/types/ForeignFmc'

export const foreignFmcApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getForeignFmcs: builder.query<ForeignFmc[], void>({
      providesTags: () => [{ type: 'ForeignFmcs' }],
      query: () => `/foreign_fmcs`
    })
  })
})

export const { useGetForeignFmcsQuery } = foreignFmcApi
