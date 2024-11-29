import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { EditedReporting, Reporting, ReportingCreation } from './types'

const ARCHIVE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu archiver ce signalement."
const ARCHIVE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu archiver ces signalements."
const CREATE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu créer ce signalement."
const DELETE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ce signalement."
const DELETE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ces signalements."
const GET_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des signalements."
const UPDATE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu modifier ce signalement."

export const reportingApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    archiveReporting: builder.mutation<void, number>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: reportingId => ({
        method: 'PUT',
        url: `/reportings/${reportingId}/archive`
      }),
      transformErrorResponse: response => new FrontendApiError(ARCHIVE_REPORTING_ERROR_MESSAGE, response)
    }),

    archiveReportings: builder.mutation<void, number[]>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: reportingIds => ({
        body: reportingIds,
        method: 'PUT',
        url: `/reportings/archive`
      }),
      transformErrorResponse: response => new FrontendApiError(ARCHIVE_REPORTINGS_ERROR_MESSAGE, response)
    }),

    createReporting: builder.mutation<Reporting.Reporting, ReportingCreation>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: newReportingFormData => ({
        body: newReportingFormData,
        method: 'POST',
        url: `/reportings`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_REPORTING_ERROR_MESSAGE, response)
    }),

    deleteReporting: builder.mutation<void, number>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: reportingId => ({
        method: 'DELETE',
        url: `/reportings/${reportingId}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_REPORTING_ERROR_MESSAGE, response)
    }),

    deleteReportings: builder.mutation<void, number[]>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: reportingIds => ({
        body: reportingIds,
        method: 'DELETE',
        url: `/reportings`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_REPORTINGS_ERROR_MESSAGE, response)
    }),

    getReportings: builder.query<Array<Reporting.Reporting>, void>({
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: () => ({
        method: 'GET',
        url: '/reportings'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_REPORTINGS_ERROR_MESSAGE, response)
    }),

    updateReporting: builder.mutation<Reporting.Reporting, { id: number; nextReportingFormData: EditedReporting }>({
      invalidatesTags: [{ type: RtkCacheTagType.Reportings }],
      query: ({ id, nextReportingFormData }) => ({
        body: nextReportingFormData,
        method: 'PUT',
        url: `/reportings/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_REPORTING_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetReportingsQuery } = reportingApi
