import { monitorfishApi, monitorfishApiKy } from '@api/api'
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

export const fleetSegmentApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
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

export const UPDATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu modifier le segment de flotte"
export const CREATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu créer le segment de flotte"
export const DELETE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le segment de flotte"
export const GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer les années des segments de flotte"
export const ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter une nouvelle année de segments de flotte"

/**
 * Delete a fleet segment
 *
 * @throws {@link FrontendApiError}
 */
async function deleteFleetSegmentFromAPI(segment: string, year: number): Promise<FleetSegment[]> {
  try {
    return await monitorfishApiKy
      .delete(`/bff/v1/admin/fleet_segments?year=${year}&segment=${segment}`)
      .json<FleetSegment[]>()
  } catch (err) {
    throw new FrontendApiError(DELETE_FLEET_SEGMENT_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Create a fleet segment
 *
 * @throws {@link FrontendApiError}
 */
async function createFleetSegmentFromAPI(segmentFields: FleetSegment): Promise<FleetSegment> {
  try {
    return await monitorfishApiKy
      .post('/bff/v1/admin/fleet_segments', {
        json: segmentFields
      })
      .json<FleetSegment>()
  } catch (err) {
    throw new FrontendApiError(CREATE_FLEET_SEGMENT_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Add a new fleet segments year
 *
 * @throws {@link FrontendApiError}
 */
async function addFleetSegmentYearFromAPI(nextYear: number) {
  try {
    return await monitorfishApiKy.post(`/bff/v1/admin/fleet_segments/${nextYear}`)
  } catch (err) {
    throw new FrontendApiError(ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Get fleet segment year entries
 *
 * @throws {@link FrontendApiError}
 */
async function getFleetSegmentYearEntriesFromAPI(): Promise<number[]> {
  try {
    return await monitorfishApiKy.get('/bff/v1/admin/fleet_segments/years').json<number[]>()
  } catch (err) {
    throw new FrontendApiError(GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export {
  deleteFleetSegmentFromAPI,
  createFleetSegmentFromAPI,
  getFleetSegmentYearEntriesFromAPI,
  addFleetSegmentYearFromAPI
}
