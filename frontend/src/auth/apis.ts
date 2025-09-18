import { monitorfishApi } from '@api/api'

import type { AuthorizedUser } from './types'

export const authorizationAPI = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getCurrentUserAuthorization: builder.query<AuthorizedUser, void>({
      keepUnusedDataFor: 0,
      query: () => '/authorization/current'
    })
  })
})

export const { useGetCurrentUserAuthorizationQuery } = authorizationAPI
