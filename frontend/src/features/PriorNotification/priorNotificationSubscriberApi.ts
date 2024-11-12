import { monitorfishApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { PriorNotificationSubscriber } from './PriorNotificationSubscriber.types'

const GET_PRIOR_NOTIFICATION_SUBSCRIBER_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les inscriptions de cette unité."
const GET_PRIOR_NOTIFICATION_SUBSCRIBERS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer la liste des inscrits aux préavis."
const UPDATE_PRIOR_NOTIFICATION_SUBSCRIBER_ERROR_MESSAGE =
  "Nous n'avons pas pu mettre à jour les inscriptions de cette unité."

export const priorNotificationSubscriberApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotificationSubscriber: builder.query<PriorNotificationSubscriber.Subscriber, number>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationSubscribers }],
      query: controlUnitId => `/prior_notification_subscribers/${controlUnitId}`,
      transformErrorResponse: response =>
        new FrontendApiError(GET_PRIOR_NOTIFICATION_SUBSCRIBER_ERROR_MESSAGE, response)
    }),

    getPriorNotificationSubscribers: builder.query<
      PriorNotificationSubscriber.Subscriber[],
      BackendApi.RequestSortingParams<PriorNotificationSubscriber.ApiListSortColumn> &
        PriorNotificationSubscriber.ApiListFilter
    >({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationSubscribers }],
      query: queryParams => getUrlOrPathWithQueryParams(`/prior_notification_subscribers`, queryParams),
      transformErrorResponse: response =>
        new FrontendApiError(GET_PRIOR_NOTIFICATION_SUBSCRIBERS_ERROR_MESSAGE, response)
    }),

    updatePriorNotificationSubscriber: builder.mutation<
      PriorNotificationSubscriber.Subscriber,
      PriorNotificationSubscriber.FormData
    >({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotificationSubscribers }],
      query: formData => ({
        body: formData,
        method: 'PUT',
        url: `/prior_notification_subscribers/${formData.controlUnitId}`
      }),
      transformErrorResponse: response =>
        new FrontendApiError(UPDATE_PRIOR_NOTIFICATION_SUBSCRIBER_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetPriorNotificationSubscriberQuery, useGetPriorNotificationSubscribersQuery } =
  priorNotificationSubscriberApi
