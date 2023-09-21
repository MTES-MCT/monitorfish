import { monitorfishApi, monitorfishApiKy } from '.'
import { ApiError } from '../libs/ApiError'

import type { MissionAction } from '../domain/types/missionAction'

export const infractionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getInfractions: builder.query<MissionAction.Infraction[], void>({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `infractions`
    })
  })
})

export const { useGetInfractionsQuery } = infractionApi

export const INFRACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les NATINFs"

/**
 * Get fishing infractions
 *
 * @throws {ApiError}
 */
async function getInfractionsFromAPI() {
  try {
    return await monitorfishApiKy.get(`/bff/v1/infractions`).json<Array<MissionAction.Infraction>>()
  } catch (err) {
    throw new ApiError(INFRACTIONS_ERROR_MESSAGE, err)
  }
}

export { getInfractionsFromAPI }
