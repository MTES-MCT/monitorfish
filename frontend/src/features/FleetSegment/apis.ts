import { monitorfishApi } from '@api/api'
import { FleetSegmentSchema } from '@features/FleetSegment/types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { FleetSegment } from '@features/FleetSegment/types'

export type ComputeFleetSegmentsParams = {
  faoAreas: string[]
  gears: MissionAction.GearControl[]
  species: MissionAction.SpeciesControl[]
  vesselId: number
  year: number
}

export type UpdateFleetSegmentParams = {
  segment: string
  updatedSegment: FleetSegment
}

export const UPDATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu modifier le segment de flotte"
export const CREATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu créer le segment de flotte"
export const DELETE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le segment de flotte"
export const GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer les années des segments de flotte"
export const ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter une nouvelle année de segments de flotte"

export const fleetSegmentApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    addFleetSegmentYear: builder.mutation<void, number>({
      query: nextYear => ({
        method: 'POST',
        url: `/admin/fleet_segments/${nextYear}`
      }),
      transformErrorResponse: response => new FrontendApiError(ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE, response)
    }),
    computeFleetSegments: builder.query<FleetSegment[], ComputeFleetSegmentsParams>({
      query: params => ({
        body: params,
        method: 'POST',
        url: `/fleet_segments/compute`
      }),
      transformResponse: (baseQueryReturnValue: FleetSegment[]) =>
        baseQueryReturnValue
          .map(segment => FleetSegmentSchema.parse(segment))
          .sort((a, b) => a.segment.localeCompare(b.segment))
    }),
    createFleetSegment: builder.mutation<FleetSegment, FleetSegment>({
      query: segmentFields => ({
        body: segmentFields,
        method: 'POST',
        url: '/admin/fleet_segments'
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_FLEET_SEGMENT_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FleetSegment) => FleetSegmentSchema.parse(baseQueryReturnValue)
    }),
    deleteFleetSegment: builder.mutation<FleetSegment[], { segment: string; year: number }>({
      query: ({ segment, year }) => ({
        method: 'DELETE',
        url: `/admin/fleet_segments?year=${year}&segment=${segment}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_FLEET_SEGMENT_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FleetSegment[]) =>
        baseQueryReturnValue
          .map(segment => FleetSegmentSchema.parse(segment))
          .sort((a, b) => a.segment.localeCompare(b.segment))
    }),
    getFleetSegments: builder.query<FleetSegment[], number | void>({
      providesTags: () => [{ type: 'FleetSegments' }],
      query: year => {
        const controlledYear = year || customDayjs.utc().year()

        return `fleet_segments/${controlledYear}`
      },
      transformResponse: (baseQueryReturnValue: FleetSegment[]) =>
        baseQueryReturnValue
          .map(segment => FleetSegmentSchema.parse(segment))
          .sort((a, b) => a.segment.localeCompare(b.segment))
    }),
    getFleetSegmentYearEntries: builder.query<number[], void>({
      query: () => '/admin/fleet_segments/years',
      transformErrorResponse: response => new FrontendApiError(GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE, response)
    }),
    updateFleetSegment: builder.query<FleetSegment, UpdateFleetSegmentParams>({
      query: params => {
        const updatedSegment = FleetSegmentSchema.parse(params.updatedSegment)

        return {
          body: updatedSegment,
          method: 'PUT',
          url: `/admin/fleet_segments?segment=${params.segment}`
        }
      },
      transformErrorResponse: response => new FrontendApiError(UPDATE_FLEET_SEGMENT_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FleetSegment) => FleetSegmentSchema.parse(baseQueryReturnValue)
    })
  })
})

export const { useGetFleetSegmentsQuery } = fleetSegmentApi
