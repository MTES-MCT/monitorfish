import { BackendApi } from '@api/BackendApi.types'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { getStaticApiFilterFromListFilter } from './components/PriorNotificationList/utils'
import { monitorfishApi } from '../../api/api'

import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotification: builder.query<PriorNotification.PriorNotificationDetail, string>({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: logbookMessageReportId => `/prior_notifications/${logbookMessageReportId}`
    }),

    getPriorNotifications: builder.query<
      BackendApi.ResponseBodyPaginatedList<PriorNotification.PriorNotification, LogbookMessage.ApiListExtraData>,
      {
        apiPaginationParams: BackendApi.RequestPaginationParams
        apiSortingParams: BackendApi.RequestSortingParams<LogbookMessage.ApiSortColumn>
        listFilter: ListFilter
      }
    >({
      providesTags: () => [{ type: 'PriorNotifications' }],
      query: ({ apiPaginationParams, apiSortingParams, listFilter }) => {
        const queryParams: BackendApi.RequestPaginationParams &
          BackendApi.RequestSortingParams<LogbookMessage.ApiSortColumn> &
          LogbookMessage.ApiFilter = {
          ...apiPaginationParams,
          ...apiSortingParams,
          ...getStaticApiFilterFromListFilter(listFilter)
        }

        return getUrlOrPathWithQueryParams(`/prior_notifications`, queryParams)
      }
    }),

    getPriorNotificationTypes: builder.query<string[], void>({
      providesTags: () => [{ type: 'PriorNotificationTypes' }],
      query: () => '/prior_notifications/types'
    })
  })
})

export const {
  useGetPriorNotificationQuery,
  useGetPriorNotificationsQuery,
  useGetPriorNotificationTypesQuery,
  useLazyGetPriorNotificationsQuery
} = priorNotificationApi
