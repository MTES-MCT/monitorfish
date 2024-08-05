import { monitorfishApi, monitorfishPublicApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { getStaticApiFilterFromListFilter } from './components/PriorNotificationList/utils'
import { PriorNotification } from './PriorNotification.types'

import type { ListFilter } from './components/PriorNotificationList/types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

const COMPUTE_PRIOR_NOTIFICATION_ERROR_MESSAGE =
  "Nous n'avons pas pu calculer note de risque, segments ou types pour ce préavis."
const CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu créé le préavis."
const UPDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu modifier le préavis."
const GET_PRIOR_NOTIFICATION_DATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les données du préavis."
const GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le préavis."
const GET_PRIOR_NOTIFICATIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des préavis."
const GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des types de préavis."
const GET_PRIOR_NOTIFICATION_PDF_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le PDF du préavis."
const VERIFY_AND_SEND_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu vérifier et envoyer le préavis."
const INVALIDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu invalider et envoyer le préavis."

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    computePriorNotification: builder.mutation<
      PriorNotification.ManualPriorNotificationComputedValues,
      PriorNotification.PriorNotificationComputeRequestData
    >({
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
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }],
      query: data => ({
        body: data,
        method: 'POST',
        url: `/prior_notifications/manual`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    getPriorNotificationDetail: builder.query<
      PriorNotification.PriorNotificationDetail,
      PriorNotification.PriorNotificationIdentifier & {
        isManuallyCreated: boolean
      }
    >({
      providesTags: (_, __, { reportId }) => [{ id: reportId, type: RtkCacheTagType.PriorNotification }],
      query: ({ isManuallyCreated, operationDate, reportId }) =>
        getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}`, { isManuallyCreated, operationDate }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE, response)
    }),

    getPriorNotificationFormData: builder.query<
      PriorNotification.ManualPriorNotificationData,
      PriorNotification.PriorNotificationIdentifier
    >({
      providesTags: (_, __, { reportId }) => [{ id: reportId, type: RtkCacheTagType.PriorNotification }],
      query: ({ operationDate, reportId }) =>
        getUrlOrPathWithQueryParams(`/prior_notifications/manual/${reportId}`, { operationDate }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_DATA_ERROR_MESSAGE, response)
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

    getPriorNotificationsToVerify: builder.query<LogbookMessage.ApiListExtraData, void>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationsToVerify }],
      query: () => '/prior_notifications/to_verify',
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE, response)
    }),

    getPriorNotificationTypes: builder.query<string[], void>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationTypes }],
      query: () => '/prior_notifications/types',
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE, response)
    }),

    invalidatePriorNotification: builder.mutation<
      PriorNotification.PriorNotificationDetail,
      PriorNotification.PriorNotificationIdentifier & {
        isManuallyCreated: boolean
      }
    >({
      invalidatesTags: (_, __, { reportId }) => [
        { type: RtkCacheTagType.PriorNotifications },
        { id: reportId, type: RtkCacheTagType.PriorNotification }
      ],
      query: ({ isManuallyCreated, operationDate, reportId }) => ({
        method: 'PUT',
        url: getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}/invalidate`, {
          isManuallyCreated,
          operationDate
        })
      }),
      transformErrorResponse: response => new FrontendApiError(INVALIDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    updateManualPriorNotification: builder.mutation<
      PriorNotification.ManualPriorNotificationData,
      {
        data: PriorNotification.NewManualPriorNotificationData
        reportId: string
      }
    >({
      invalidatesTags: (_, __, { reportId }) => [
        { type: RtkCacheTagType.PriorNotifications },
        { id: reportId, type: RtkCacheTagType.PriorNotification }
      ],
      query: ({ data, reportId }) => ({
        body: data,
        method: 'PUT',
        url: `/prior_notifications/manual/${reportId}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    updatePriorNotificationNote: builder.mutation<
      PriorNotification.PriorNotificationDetail,
      PriorNotification.PriorNotificationIdentifier & {
        data: PriorNotification.PriorNotificationUpdateNoteRequestData
      }
    >({
      invalidatesTags: (_, __, { reportId }) => [
        { type: RtkCacheTagType.PriorNotifications },
        { id: reportId, type: RtkCacheTagType.PriorNotification }
      ],
      query: ({ data, operationDate, reportId }) => ({
        body: data,
        method: 'PUT',
        url: getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}/note`, { operationDate })
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    verifyAndSendPriorNotification: builder.mutation<
      PriorNotification.PriorNotificationDetail,
      PriorNotification.PriorNotificationIdentifier & {
        isManuallyCreated: boolean
      }
    >({
      invalidatesTags: (_, __, { reportId }) => [
        { type: RtkCacheTagType.PriorNotifications },
        { id: reportId, type: RtkCacheTagType.PriorNotification }
      ],
      query: ({ isManuallyCreated, operationDate, reportId }) => ({
        method: 'POST',
        url: getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}/verify_and_send`, {
          isManuallyCreated,
          operationDate
        })
      }),
      transformErrorResponse: response =>
        new FrontendApiError(VERIFY_AND_SEND_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    })
  })
})

export const priorNotificationPublicApi = monitorfishPublicApi.injectEndpoints({
  endpoints: builder => ({
    getPriorNotificationPDF: builder.query<string, string>({
      extraOptions: { maxRetries: 0 },
      forceRefetch: () => true,
      query: reportId => ({
        method: 'GET',
        responseHandler: response => response.text(),
        url: `/v1/prior_notifications/pdf/${reportId}`
      }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_PDF_ERROR_MESSAGE, response)
    })
  })
})

export const {
  useGetPriorNotificationDetailQuery,
  useGetPriorNotificationsQuery,
  useGetPriorNotificationsToVerifyQuery,
  useGetPriorNotificationTypesQuery,
  useInvalidatePriorNotificationMutation
} = priorNotificationApi

export const { useGetPriorNotificationPDFQuery } = priorNotificationPublicApi
