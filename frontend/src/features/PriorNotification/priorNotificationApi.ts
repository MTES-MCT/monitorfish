import { monitorfishApi } from '@api/api'
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
const DELETE_PRIOR_NOTIFICATION_UPLOAD_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ce document attaché."
const GET_PRIOR_NOTIFICATION_UPLOADS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer les documents attachés à ce préavis."
const UPDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu modifier le préavis."
const GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le préavis."
const GET_PRIOR_NOTIFICATIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des préavis."
const GET_PRIOR_NOTIFICATION_TYPES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des types de préavis."
const GET_PRIOR_NOTIFICATION_PDF_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le PDF du préavis."
const VERIFY_AND_SEND_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu vérifier et envoyer le préavis."
const INVALIDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu invalider et envoyer le préavis."

export enum StatusBodyEnum {
  FOUND = 'FOUND',
  NO_CONTENT = 'NO_CONTENT'
}

type StatusBody = {
  status: StatusBodyEnum
}

export const priorNotificationApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    computeManualPriorNotification: builder.mutation<
      PriorNotification.ManualComputedValues,
      PriorNotification.ManualComputeRequestData
    >({
      query: data => ({
        body: data,
        method: 'POST',
        url: `/prior_notifications/manual/compute`
      }),
      transformErrorResponse: response => new FrontendApiError(COMPUTE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    createPriorNotification: builder.mutation<PriorNotification.ManualForm, PriorNotification.NewManualForm>({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotifications }],
      query: data => ({
        body: data,
        method: 'POST',
        url: `/prior_notifications/manual`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    deletePriorNotificationUpload: builder.mutation<void, { priorNotificationUploadId; reportId: string }>({
      invalidatesTags: [{ type: RtkCacheTagType.PriorNotificationDocuments }],
      query: ({ priorNotificationUploadId, reportId }) => ({
        method: 'DELETE',
        url: `/prior_notifications/${reportId}/uploads/${priorNotificationUploadId}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_PRIOR_NOTIFICATION_UPLOAD_ERROR_MESSAGE, response)
    }),

    getPriorNotificationDetail: builder.query<
      PriorNotification.Detail,
      PriorNotification.Identifier & {
        isManuallyCreated: boolean
      }
    >({
      providesTags: (_, __, { reportId }) => [{ id: reportId, type: RtkCacheTagType.PriorNotification }],
      query: ({ isManuallyCreated, operationDate, reportId }) =>
        getUrlOrPathWithQueryParams(`/prior_notifications/${reportId}`, { isManuallyCreated, operationDate }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_DETAIL_ERROR_MESSAGE, response)
    }),

    getPriorNotificationPdfExistence: builder.query<StatusBody, string>({
      extraOptions: { maxRetries: 0 },
      forceRefetch: () => true,
      query: reportId => ({
        method: 'GET',
        url: `/prior_notifications/${reportId}/pdf/exist`
      }),
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_PDF_ERROR_MESSAGE, response)
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

    getPriorNotificationUploads: builder.query<PriorNotification.Upload[], string>({
      providesTags: () => [{ type: RtkCacheTagType.PriorNotificationDocuments }],
      query: reportId => `/prior_notifications/${reportId}/uploads`,
      transformErrorResponse: response => new FrontendApiError(GET_PRIOR_NOTIFICATION_UPLOADS_ERROR_MESSAGE, response)
    }),

    invalidatePriorNotification: builder.mutation<
      PriorNotification.Detail,
      PriorNotification.Identifier & {
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

    updateLogbookPriorNotification: builder.mutation<
      PriorNotification.LogbookForm,
      {
        data: PriorNotification.LogbookForm
        operationDate: string
        reportId: string
      }
    >({
      invalidatesTags: (_, __, { reportId }) => [
        { type: RtkCacheTagType.PriorNotifications },
        { id: reportId, type: RtkCacheTagType.PriorNotification }
      ],
      query: ({ data, operationDate, reportId }) => ({
        body: data,
        method: 'PUT',
        url: getUrlOrPathWithQueryParams(`/prior_notifications/logbook/${reportId}`, { operationDate })
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_PRIOR_NOTIFICATION_ERROR_MESSAGE, response)
    }),

    updateManualPriorNotification: builder.mutation<
      PriorNotification.ManualForm,
      {
        data: PriorNotification.NewManualForm
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

    verifyAndSendPriorNotification: builder.mutation<
      PriorNotification.Detail,
      PriorNotification.Identifier & {
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

export const {
  useGetPriorNotificationPdfExistenceQuery,
  useGetPriorNotificationsQuery,
  useGetPriorNotificationsToVerifyQuery,
  useGetPriorNotificationTypesQuery,
  useGetPriorNotificationUploadsQuery
} = priorNotificationApi
