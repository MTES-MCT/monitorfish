import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { monitorfishApi } from '../../api/api'

import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotification: builder.query<PriorNotification.PriorNotificationDetail, string>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: logbookMessageReportId => `/prior_notifications/${logbookMessageReportId}`
    }),

    getPriorNotifications: builder.query<PriorNotification.PriorNotification[], LogbookMessage.ApiFilter>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: filter => getUrlOrPathWithQueryParams(`/prior_notifications`, filter)
    }),

    getPriorNotificationTypes: builder.query<string[], void>({
      providesTags: () => [{ type: 'PriorNotificationTypes' }],
      query: () => '/prior_notifications/types'
    })
  })
})

export const { useGetPriorNotificationQuery, useGetPriorNotificationsQuery, useGetPriorNotificationTypesQuery } =
  priorNotificationApi
