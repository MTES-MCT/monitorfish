import { monitorfishApiKy, monitorfishPublicApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { Infraction } from '../../domain/types/infraction'
import type { Threat } from '@features/Infraction/types'

export const infractionApi = monitorfishPublicApi.injectEndpoints({
  endpoints: builder => ({
    getInfractions: builder.query<Infraction[], void>({
      providesTags: () => [{ type: 'Infractions' }],
      query: () => `/v1/infractions`
    }),
    getThreatCharacterizations: builder.query<Threat[], void>({
      query: () => `/v1/infractions/threats`
    })
  })
})

export const { useGetInfractionsQuery, useGetThreatCharacterizationsQuery } = infractionApi

export const INFRACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les NATINFs"

/**
 * Get fishing infractions
 *
 * @throws {FrontendApiError}
 */
async function getInfractionsFromAPI() {
  try {
    return await monitorfishApiKy.get(`/api/v1/infractions`).json<Array<Infraction>>()
  } catch (err) {
    throw new FrontendApiError(INFRACTIONS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export { getInfractionsFromAPI }
