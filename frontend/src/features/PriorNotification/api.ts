import { monitorenvApi } from '../../api/api'

import type { PriorNotification } from './PriorNotification.types'

// TODO Replace that (and uncomment tags). Temporarely using Fake Env API to use mappings.
export const priorNotificationApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getNotices: builder.query<PriorNotification.PriorNotification[], void>({
      // providesTags: () => [{ type: 'Notices' }],
      query: () => `/v1/prior_notifications`
    })
  })
})

export const { useGetNoticesQuery } = priorNotificationApi
