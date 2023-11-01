import { monitorfishApiKy, monitorfishPublicApi } from '.'
import { ApiError } from '../libs/ApiError'

import type { Infraction } from '../domain/types/infraction'

export const infractionApi = monitorfishPublicApi.injectEndpoints({
  endpoints: builder => ({
    getInfractions: builder.query<Infraction[], void>({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `/v1/infractions`
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
    return await monitorfishApiKy.get(`/api/v1/infractions`).json<Array<Infraction>>()
  } catch (err) {
    throw new ApiError(INFRACTIONS_ERROR_MESSAGE, err)
  }
}

export { getInfractionsFromAPI }
