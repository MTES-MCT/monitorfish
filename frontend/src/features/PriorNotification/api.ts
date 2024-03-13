import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { monitorfishApi } from '../../api/api'

import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotifications: builder.query<PriorNotification.PriorNotification[], LogbookMessage.ApiFilter>({
      providesTags: () => [{ type: 'Notices' }],
      query: filter => getUrlOrPathWithQueryParams(`/prior-notifications`, filter)
    })
  })
})

export const { useGetPriorNotificationsQuery } = priorNotificationApi
