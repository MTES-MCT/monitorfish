import { monitorfishApi, monitorfishApiKy } from '@api/api'
import { ApiError } from '@libs/ApiError'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { FleetSegment, UpdateFleetSegment } from '@features/FleetSegment/types'

export type ComputeFleetSegmentsParams = {
  faoAreas: string[]
  gears: string[]
  species: string[]
}

export const fleetSegmentApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    computeFleetSegments: builder.query<FleetSegment[], ComputeFleetSegmentsParams>({
      query: params =>
        `fleet_segments/compute?faoAreas=${params.faoAreas}&gears=${params.gears}&species=${params.species}`,
      transformResponse: (baseQueryReturnValue: FleetSegment[]) =>
        baseQueryReturnValue.sort((a, b) => a.segment.localeCompare(b.segment))
    }),
    getFleetSegments: builder.query<FleetSegment[], number | void>({
      providesTags: () => [{ type: 'FleetSegments' }],
      query: year => {
        const controlledYear = year || customDayjs.utc().year()

        return `fleet_segments/${controlledYear}`
      },
      transformResponse: (baseQueryReturnValue: FleetSegment[]) =>
        baseQueryReturnValue.sort((a, b) => a.segment.localeCompare(b.segment))
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
 * Update a fleet segment
 *
 * @throws {@link ApiError}
 */
async function updateFleetSegmentFromAPI(
  segment: string,
  year: number,
  updatedFields: UpdateFleetSegment
): Promise<FleetSegment> {
  try {
    return await monitorfishApiKy
      .put(`/bff/v1/fleet_segments?year=${year}&segment=${segment}`, {
        json: updatedFields
      })
      .json<FleetSegment>()
  } catch (err) {
    throw new ApiError(UPDATE_FLEET_SEGMENT_ERROR_MESSAGE, err)
  }
}

/**
 * Delete a fleet segment
 *
 * @throws {@link ApiError}
 */
async function deleteFleetSegmentFromAPI(segment: string, year: number): Promise<FleetSegment[]> {
  try {
    return await monitorfishApiKy
      .delete(`/bff/v1/fleet_segments?year=${year}&segment=${segment}`)
      .json<FleetSegment[]>()
  } catch (err) {
    throw new ApiError(DELETE_FLEET_SEGMENT_ERROR_MESSAGE, err)
  }
}

/**
 * Create a fleet segment
 *
 * @throws {@link ApiError}
 */
async function createFleetSegmentFromAPI(segmentFields: UpdateFleetSegment): Promise<FleetSegment> {
  try {
    return await monitorfishApiKy
      .post('/bff/v1/fleet_segments', {
        json: segmentFields
      })
      .json<FleetSegment>()
  } catch (err) {
    throw new ApiError(CREATE_FLEET_SEGMENT_ERROR_MESSAGE, err)
  }
}

/**
 * Add a new fleet segments year
 *
 * @throws {@link ApiError}
 */
async function addFleetSegmentYearFromAPI(nextYear: number) {
  try {
    return await monitorfishApiKy.post(`/bff/v1/fleet_segments/${nextYear}`)
  } catch (err) {
    throw new ApiError(ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE, err)
  }
}

/**
 * Get fleet segment year entries
 *
 * @throws {@link ApiError}
 */
async function getFleetSegmentYearEntriesFromAPI(): Promise<number[]> {
  try {
    return await monitorfishApiKy.get('/bff/v1/fleet_segments/years').json<number[]>()
  } catch (err) {
    throw new ApiError(GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE, err)
  }
}

export {
  updateFleetSegmentFromAPI,
  deleteFleetSegmentFromAPI,
  createFleetSegmentFromAPI,
  getFleetSegmentYearEntriesFromAPI,
  addFleetSegmentYearFromAPI
}
