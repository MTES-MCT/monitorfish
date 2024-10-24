import { monitorfishApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import type { TableFilter } from './components/PriorNotificationSubscriberTable/types'
import type { PriorNotificationSubscriber } from './PriorNotificationSubscriber.types'

const GET_PRIOR_NOTIFICATION_SUBSCRIBERS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer la liste des inscrits aux préavis."

export const priorNotificationSubscriberApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotificationSubscribers: builder.query<
      PriorNotificationSubscriber.Subscriber[],
      BackendApi.RequestSortingParams<PriorNotificationSubscriber.ApiSortColumn> & TableFilter
    >({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotifications }],
      query: (queryParams: BackendApi.RequestSortingParams<PriorNotificationSubscriber.ApiSortColumn> & TableFilter) =>
        getUrlOrPathWithQueryParams(`/prior_notification_subscribers`, queryParams),
      transformErrorResponse: response =>
        new FrontendApiError(GET_PRIOR_NOTIFICATION_SUBSCRIBERS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetPriorNotificationSubscribersQuery } = priorNotificationSubscriberApi
