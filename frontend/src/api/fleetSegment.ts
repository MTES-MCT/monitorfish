import ky from 'ky'

import { monitorfishApi } from '.'
import { ApiError } from '../libs/ApiError'
import { dayjs } from '../utils/dayjs'

import type { FleetSegment, UpdateFleetSegment } from '../domain/types/fleetSegment'

export const fleetSegmentApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getFleetSegments: builder.query<FleetSegment[], void>({
      providesTags: () => [{ type: 'FleetSegments' }],
      // TODO This will bug each 1st january at midnight.
      query: () => `fleet_segments/${dayjs().year()}`
    })
  })
})

export const { useGetFleetSegmentsQuery } = fleetSegmentApi

export const FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les segments de flotte"
export const UPDATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu modifier le segment de flotte"
export const CREATE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu créer le segment de flotte"
export const DELETE_FLEET_SEGMENT_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le segment de flotte"
export const GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer les années des segments de flotte"
export const ADD_FLEET_SEGMENT_YEAR_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter une nouvelle année de segments de flotte"

/**
 * Get Fleet segments
 *
 * @throws {@link ApiError}
 */
async function getAllFleetSegmentFromAPI(year?: number): Promise<FleetSegment[]> {
  const currentYear = year || dayjs().year()

  try {
    return await ky.get(`/bff/v1/fleet_segments/${currentYear}`).json<FleetSegment[]>()
  } catch (err) {
    throw new ApiError(FLEET_SEGMENT_ERROR_MESSAGE, err)
  }
}

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
    return await ky
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
    return await ky.delete(`/bff/v1/fleet_segments?year=${year}&segment=${segment}`).json<FleetSegment[]>()
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
    return await ky
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
    return await ky.post(`/bff/v1/fleet_segments/${nextYear}`)
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
    return await ky.get('/bff/v1/fleet_segments/years').json<number[]>()
  } catch (err) {
    throw new ApiError(GET_FLEET_SEGMENT_YEAR_ENTRIES_ERROR_MESSAGE, err)
  }
}

export {
  getAllFleetSegmentFromAPI,
  updateFleetSegmentFromAPI,
  deleteFleetSegmentFromAPI,
  createFleetSegmentFromAPI,
  getFleetSegmentYearEntriesFromAPI,
  addFleetSegmentYearFromAPI
}
