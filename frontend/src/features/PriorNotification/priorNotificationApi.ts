import { BackendApi } from '@api/BackendApi.types'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { getStaticApiFilterFromListFilter } from './components/PriorNotificationList/utils'
import { monitorfishApi } from '../../api/api'

import type { ListFilter } from './components/PriorNotificationList/types'
import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

const COMPUTE_PRIOR_NOTIFICATION_ERROR_MESSAGE =
  "Nous n'avons pas pu calculer note de risque, segments ou types pour ce préavis."
const CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu créé le préavis."
const GET_PRIOR_NOTIFICATION_DATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les données du préavis."
const GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le préavis."
const GET_PRIOR_NOTIFICATIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des préavis."
const GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des types de préavis."
const VERIFY_AND_SEND_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu vérifier et envoyer le préavis."

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    computePriorNotification: builder.mutation<
      PriorNotification.ManualPriorNotificationComputedValues,
      PriorNotification.ManualPriorNotificationComputeRequestData
    >({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }],
      query: data => ({
        body: data,
        method: 'POST',
        url: `/prior_notifications/manual/compute`
      }),
      transformErrorResponse: response => new FrontendApiError(COMPUTE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    createPriorNotification: builder.mutation<
      PriorNotification.ManualPriorNotificationData,
      PriorNotification.NewManualPriorNotificationData
    >({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }, { type: RtkCacheTagType.PriorNotification }],
      query: data => ({
        body: data,
        method: 'POST',
        url: `/prior_notifications/manual`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    getPriorNotificationData: builder.query<PriorNotification.ManualPriorNotificationData, string>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotification }],
      query: reportId => `/prior_notifications/manual/${reportId}`,
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_DATA_ERROR_MESSAGE, response)
    }),

    getPriorNotificationDetail: builder.query<
      PriorNotification.PriorNotificationDetail,
      {
        isManuallyCreated: boolean
        reportId: string
      }
    >({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotification }],
      query: ({ isManuallyCreated, reportId }) =>
        getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}`, { isManuallyCreated }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE, response)
    }),

    getPriorNotifications: builder.query<
      BackendApi.ResponseBodyPaginatedList<PriorNotification.PriorNotification, LogbookMessage.ApiListExtraData>,
      {
        apiPaginationParams: BackendApi.RequestPaginationParams
        apiSortingParams: BackendApi.RequestSortingParams<LogbookMessage.ApiSortColumn>
        listFilter: ListFilter
      }
    >({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotifications }],
      query: ({
        apiPaginationParams,
        apiSortingParams,
        listFilter
      }: {
        apiPaginationParams: BackendApi.RequestPaginationParams
        apiSortingParams: BackendApi.RequestSortingParams<LogbookMessage.ApiSortColumn>
        listFilter: ListFilter
      }) => {
        const queryParams = {
          ...apiPaginationParams,
          ...apiSortingParams,
          ...getStaticApiFilterFromListFilter(listFilter)
        }

        return getUrlOrPathWithQueryParams(`/prior_notifications`, queryParams)
      },
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATIONS_ERROR_MESSAGE, response)
    }),

    getPriorNotificationTypes: builder.query<string[], void>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationTypes }],
      query: () => '/prior_notifications/types',
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE, response)
    }),

    updatePriorNotification: builder.mutation<
      PriorNotification.ManualPriorNotificationData,
      {
        data: PriorNotification.NewManualPriorNotificationData
        reportId: string
      }
    >({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }],
      query: ({ data, reportId }) => ({
        body: data,
        method: 'PUT',
        url: `/prior_notifications/manual/${reportId}`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    verifyAndSendPriorNotification: builder.mutation<
      PriorNotification.PriorNotificationDetail,
      {
        isManuallyCreated: boolean
        reportId: string
      }
    >({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }, { type: RtkCacheTagType.PriorNotification }],
      query: ({ isManuallyCreated, reportId }) => ({
        method: 'POST',
        url: getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}/verify_and_send`, { isManuallyCreated })
      }),
      transformErrorResponse: response =>
        new FrontendApiError(VERIFY_AND_SEND_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetPriorNotificationsQuery, useGetPriorNotificationTypesQuery } = priorNotificationApi
