import { monitorfishApi } from '@api/api'
import { HttpStatusCode, RtkCacheTagType } from '@api/constants'
import { ActiveVesselSchema } from '@features/Vessel/schemas/ActiveVesselSchema'
import { VesselSchema } from '@features/Vessel/schemas/VesselSchema'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { getVesselIdentityFromLegacyVesselIdentity, getVesselIdentityPropsAsEmptyStringsWhenUndefined } from './utils'
import { Vessel } from './Vessel.types'

import type { Meta } from '@api/BackendApi.types'
import type { VesselReportings } from '@features/Reporting/types'
import type { TrackRequest } from '@features/Vessel/types/types'

const GET_VESSEL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations de ce navire."
const GET_VESSEL_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les signalements de ce navire."
const SEARCH_VESSELS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les navires correspondants à cette recherche."
const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getActiveVessels: builder.query<Vessel.ActiveVessel[], void>({
      query: () => `/vessels`,
      transformResponse: (baseQueryReturnValue: Vessel.ActiveVessel[]) =>
        parseResponseOrReturn<Vessel.ActiveVessel>(baseQueryReturnValue, ActiveVesselSchema, true)
    }),

    getVessel: builder.query<Vessel.SelectedVessel, number>({
      providesTags: () => [{ type: RtkCacheTagType.Vessel }],
      query: id => `/vessels/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Vessel.SelectedVessel) =>
        parseResponseOrReturn<Vessel.SelectedVessel>(baseQueryReturnValue, VesselSchema, false)
    }),

    /**
     * Get enriched selected vessel and positions.
     *
     * Transforms the response by reading the JSON body and setting
     * `isTrackDepthModified` based on the response status.
     */
    getVesselAndPositions: builder.query<
      { isTrackDepthModified: boolean; vesselAndPositions: Vessel.VesselAndPositions },
      { trackRequest: TrackRequest; vesselIdentity: Vessel.VesselIdentity }
    >({
      providesTags: () => [{ type: RtkCacheTagType.SelectedVessel }],
      query: ({ trackRequest, vesselIdentity }) => {
        const { externalReferenceNumber, internalReferenceNumber, ircs, vesselId, vesselIdentifier } =
          getVesselIdentityPropsAsEmptyStringsWhenUndefined(getVesselIdentityFromLegacyVesselIdentity(vesselIdentity))
        const trackDepth = trackRequest.trackDepth ?? ''
        const afterDateTime = trackRequest.afterDateTime?.toISOString() ?? ''
        const beforeDateTime = trackRequest.beforeDateTime?.toISOString() ?? ''

        return {
          method: 'GET',
          params: {
            afterDateTime,
            beforeDateTime,
            externalReferenceNumber,
            internalReferenceNumber,
            IRCS: ircs,
            trackDepth,
            vesselId,
            vesselIdentifier
          },
          url: `/vessels/find`
        }
      },
      transformErrorResponse: response => new FrontendApiError(VESSEL_POSITIONS_ERROR_MESSAGE, response),
      transformResponse: async (baseQueryReturnValue: Vessel.VesselAndPositions, meta: Meta) => {
        // TODO We nee to also check the `positions` type
        if (baseQueryReturnValue.vessel) {
          parseResponseOrReturn<Vessel.SelectedVessel>(baseQueryReturnValue.vessel, VesselSchema, false)
        }

        return {
          isTrackDepthModified: meta?.response?.status === HttpStatusCode.ACCEPTED,
          vesselAndPositions: baseQueryReturnValue
        }
      }
    }),

    /**
     * Get vessel positions.
     *
     * Transforms the response by reading the JSON body and setting
     * `isTrackDepthModified` based on the response status.
     */
    getVesselPositions: builder.query<
      { isTrackDepthModified: boolean; positions: Vessel.VesselPosition[] },
      { trackRequest: TrackRequest; vesselIdentity: Vessel.VesselIdentity }
    >({
      query: ({ trackRequest, vesselIdentity }) => {
        const { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier } =
          getVesselIdentityPropsAsEmptyStringsWhenUndefined(getVesselIdentityFromLegacyVesselIdentity(vesselIdentity))
        const trackDepth = trackRequest.trackDepth ?? ''
        const afterDateTime = trackRequest.afterDateTime?.toISOString() ?? ''
        const beforeDateTime = trackRequest.beforeDateTime?.toISOString() ?? ''

        return {
          method: 'GET',
          params: {
            afterDateTime,
            beforeDateTime,
            externalReferenceNumber,
            internalReferenceNumber,
            IRCS: ircs,
            trackDepth,
            vesselIdentifier
          },

          url: `/vessels/positions`
        }
      },
      transformErrorResponse: response => new FrontendApiError(VESSEL_POSITIONS_ERROR_MESSAGE, response),
      transformResponse: async (baseQueryReturnValue: Vessel.VesselPosition[], meta: Meta) => ({
        isTrackDepthModified: meta?.response?.status === HttpStatusCode.ACCEPTED,
        positions: baseQueryReturnValue
      })
    }),

    getVesselReportingsByVesselIdentity: builder.query<
      VesselReportings,
      { fromDate: string; vesselIdentity: Vessel.VesselIdentity }
    >({
      // TODO Create a common generic handler since this pattern could be used with a few other RTK query hooks.
      onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
        } catch (err) {
          dispatch(
            displayOrLogError(
              (
                err as {
                  error: FrontendApiError
                }
              ).error, // `err.error` can only be a `FrontendApiError` that's what `transformErrorResponse()` always returns
              () => () => {
                // TODO Maybe `displayOrLogError()` should automatically unset the error boundary in the retryable use case?
                dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
                dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))
              },
              true,
              DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
            )
          )
        }
      },
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: ({ fromDate, vesselIdentity }) =>
        getUrlOrPathWithQueryParams('/vessels/reportings', {
          ...getVesselIdentityPropsAsEmptyStringsWhenUndefined(vesselIdentity),
          fromDate
        }),
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_REPORTINGS_ERROR_MESSAGE, response)
    }),

    searchVessels: builder.query<Vessel.VesselIdentity[], Vessel.ApiSearchFilter>({
      query: filter => getUrlOrPathWithQueryParams('/vessels/search', filter),
      transformErrorResponse: response => new FrontendApiError(SEARCH_VESSELS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetActiveVesselsQuery, useGetVesselQuery, useGetVesselReportingsByVesselIdentityQuery } = vesselApi
