import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { monitorfishApi } from '../../api/api'

import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotification: builder.query<PriorNotification.PriorNotificationDetail, string>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: logbookMessageReportId => `/prior_notifications/${logbookMessageReportId}`
    }),

    getPriorNotifications: builder.query<PriorNotification.PriorNotification[], LogbookMessage.ApiFilter>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: filter => getUrlOrPathWithQueryParams(`/prior_notifications`, filter)
    })
  })
})

export const { useGetPriorNotificationQuery, useGetPriorNotificationsQuery } = priorNotificationApi

const priorNotificationTypeApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotificationTypes: builder.query<string[], void>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: () => `/prior_notification_types`
    })
  })
})

export const { useGetPriorNotificationTypesQuery } = priorNotificationTypeApi
