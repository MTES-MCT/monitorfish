import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { DisplayedReportingSchema } from '@features/Reporting/schemas/DisplayedReportingSchema'
import { ReportingCreationSchema } from '@features/Reporting/schemas/ReportingCreationSchema'
import { ReportingSchema } from '@features/Reporting/schemas/ReportingSchema'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'
import { parseOrReturn } from '@utils/parseOrReturn'

import type { ApiSearchFilter, DisplayedReporting, FormEditedReporting, Reporting, ReportingCreation } from './types'

const ARCHIVE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu archiver ce signalement."
const ARCHIVE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu archiver ces signalements."
const CREATE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu créer ce signalement."
const DELETE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ce signalement."
const DELETE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ces signalements."
const GET_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des signalements."
const GET_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le signalement."
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
      query: newReportingFormData => {
        const formData = parseOrReturn<ReportingCreation>(newReportingFormData, ReportingCreationSchema, false)

        return {
          body: formData,
          method: 'POST',
          url: `/reportings`
        }
      },
      transformErrorResponse: response => new FrontendApiError(CREATE_REPORTING_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Reporting.Reporting) =>
        parseOrReturn<Reporting.Reporting>(baseQueryReturnValue, ReportingSchema, false)
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

    displayReportings: builder.query<DisplayedReporting[], ApiSearchFilter>({
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: filters => ({
        method: 'GET',
        url: getUrlOrPathWithQueryParams('/reportings/display', filters)
      }),
      transformErrorResponse: response => new FrontendApiError(GET_REPORTINGS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Reporting.Reporting[]) =>
        parseOrReturn<DisplayedReporting>(baseQueryReturnValue, DisplayedReportingSchema, true)
    }),

    getReportingById: builder.query<Reporting.EditableReporting, number>({
      query: reportingId => ({
        method: 'GET',
        url: `/reportings/${reportingId}`
      }),
      transformErrorResponse: response => new FrontendApiError(GET_REPORTING_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Reporting.Reporting) => {
        const parsed = parseOrReturn<Reporting.Reporting>(baseQueryReturnValue, ReportingSchema, false)
        if (parsed.type === ReportingType.ALERT) {
          throw new Error('Cannot edit a pending alert reporting')
        }

        return parsed as Reporting.EditableReporting
      }
    }),

    getReportings: builder.query<Reporting.Reporting[], void>({
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: () => ({
        method: 'GET',
        url: '/reportings'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_REPORTINGS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Reporting.Reporting[]) =>
        parseOrReturn<Reporting.Reporting>(baseQueryReturnValue, ReportingSchema, true)
    }),

    updateReporting: builder.mutation<Reporting.Reporting, { id: number; nextReportingFormData: FormEditedReporting }>({
      query: ({ id, nextReportingFormData }) => ({
        body: nextReportingFormData,
        method: 'PUT',
        url: `/reportings/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_REPORTING_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Reporting.Reporting) =>
        parseOrReturn<Reporting.Reporting>(baseQueryReturnValue, ReportingSchema, false)
    })
  })
})

export const { useDisplayReportingsQuery, useGetReportingByIdQuery, useGetReportingsQuery } = reportingApi
